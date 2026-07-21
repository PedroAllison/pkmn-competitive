import { round, toCanonicalName } from '../utils/format.js';
import type { BaseStats, CheckKind, NamedPct, Spread } from '../types/contract.js';

/**
 * Parser puro do formato "chaos" do Smogon
 * (`smogon.com/stats/<YYYY-MM>/chaos/<format>-<baseline>.json`).
 *
 * Notas de normalização:
 * - Os valores de Abilities/Items/Moves/Spreads/Tera são contagens PONDERADAS.
 *   O peso total do Pokémon é a soma de `Abilities` (todo set tem exatamente
 *   uma ability), então `pct = valor / pesoTotal * 100`.
 * - `Moves` somam ~4× o peso total (4 slots); o pct por move continua correto
 *   em relação ao peso total ("% de sets que usam o move"). A chave vazia ""
 *   (menos de 4 moves) é descartada.
 * - `Teammates` podem ser negativos (correlação negativa) — descartados.
 * - `Checks and Counters`: `[n, p, d]` com p = média de P(KO ou switch) e
 *   d = desvio. O chaos NÃO separa KO de switch (isso só existe no .txt de
 *   moveset), então expomos o combinado dividido igualmente entre
 *   `koPct`/`switchPct` e o `score` padrão do Smogon: `(p − 4d) × 100`.
 */

export interface ChaosEntry {
  Abilities: Record<string, number>;
  Items: Record<string, number>;
  Spreads: Record<string, number>;
  Moves: Record<string, number>;
  Teammates: Record<string, number>;
  'Checks and Counters': Record<string, [number, number, number]>;
  'Tera Types'?: Record<string, number>;
  'Raw count': number;
  usage: number;
  'Viability Ceiling'?: number[];
}

export interface ChaosFile {
  info: {
    metagame: string;
    cutoff: number;
    'number of battles': number;
  };
  data: Record<string, ChaosEntry>;
}

export interface ParsedCheck {
  name: string;
  displayName: string;
  koPct: number;
  switchPct: number;
  score: number;
  kind: CheckKind;
}

export interface ParsedTeammate {
  name: string;
  displayName: string;
  pct: number;
}

/** Entrada de usage já normalizada (percentuais 0–100), pronta para o jsonb `data`. */
export interface ParsedUsageEntry {
  /** Slug canônico (ex.: "great-tusk"). */
  name: string;
  /** Nome de exibição original do Smogon (ex.: "Great Tusk"). */
  displayName: string;
  usagePct: number;
  rank: number;
  rawCount: number;
  abilities: NamedPct[];
  items: NamedPct[];
  natures: NamedPct[];
  spreads: Spread[];
  teraTypes: NamedPct[];
  moves: NamedPct[];
  teammates: ParsedTeammate[];
  checksAndCounters: ParsedCheck[];
}

const LIMITS = {
  abilities: 6,
  items: 10,
  moves: 15,
  spreads: 8,
  tera: 10,
  teammates: 12,
  checks: 10,
} as const;

/** Score ≥ este valor ⇒ "counter"; abaixo ⇒ "check" (convenção Smogon-like). */
const COUNTER_SCORE_THRESHOLD = 70;
/** Mínimo de encontros para um check/counter ser estatisticamente relevante. */
const MIN_CHECK_ENCOUNTERS = 20;

function topPcts(
  record: Record<string, number> | undefined,
  totalWeight: number,
  limit: number,
): NamedPct[] {
  if (!record || totalWeight <= 0) return [];
  return Object.entries(record)
    .filter(([name, v]) => name !== '' && name !== 'nothing' && v > 0)
    .map(([name, v]) => ({ name, pct: round((v / totalWeight) * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, limit)
    .filter((e) => e.pct > 0);
}

/** Faz o parse de uma chave de spread "Jolly:0/252/0/0/4/252" → nature + EVs. */
export function parseSpreadKey(key: string): { nature: string; evs: BaseStats } | null {
  const [nature, evsPart] = key.split(':');
  if (!nature || !evsPart) return null;
  const nums = evsPart.split('/').map((n) => Number(n));
  if (nums.length !== 6 || nums.some((n) => !Number.isFinite(n))) return null;
  const [hp, atk, def, spa, spd, spe] = nums;
  return { nature, evs: { hp, atk, def, spa, spd, spe } };
}

function parseSpreads(
  record: Record<string, number> | undefined,
  totalWeight: number,
): { spreads: Spread[]; natures: NamedPct[] } {
  if (!record || totalWeight <= 0) return { spreads: [], natures: [] };

  const spreads: Spread[] = [];
  const natureWeights = new Map<string, number>();

  for (const [key, weight] of Object.entries(record)) {
    if (weight <= 0) continue;
    const parsed = parseSpreadKey(key);
    if (!parsed) continue;
    spreads.push({ ...parsed, pct: round((weight / totalWeight) * 100) });
    natureWeights.set(parsed.nature, (natureWeights.get(parsed.nature) ?? 0) + weight);
  }

  spreads.sort((a, b) => b.pct - a.pct);
  const natures: NamedPct[] = [...natureWeights.entries()]
    .map(([name, w]) => ({ name, pct: round((w / totalWeight) * 100) }))
    .sort((a, b) => b.pct - a.pct);

  return { spreads: spreads.slice(0, LIMITS.spreads), natures: natures.slice(0, 6) };
}

function parseChecks(record: ChaosEntry['Checks and Counters'] | undefined): ParsedCheck[] {
  if (!record) return [];
  const checks: ParsedCheck[] = [];
  for (const [name, tuple] of Object.entries(record)) {
    if (!Array.isArray(tuple) || tuple.length < 3) continue;
    const [n, p, d] = tuple;
    if (n < MIN_CHECK_ENCOUNTERS) continue;
    const score = round((p - 4 * d) * 100, 1);
    if (score <= 0) continue;
    const combined = round(p * 100, 1);
    checks.push({
      name: toCanonicalName(name),
      displayName: name,
      // O chaos não separa KO de switch — divisão igual documentada acima.
      koPct: round(combined / 2, 1),
      switchPct: round(combined / 2, 1),
      score,
      kind: score >= COUNTER_SCORE_THRESHOLD ? 'counter' : 'check',
    });
  }
  return checks.sort((a, b) => b.score - a.score).slice(0, LIMITS.checks);
}

function parseTeammates(
  record: Record<string, number> | undefined,
  totalWeight: number,
): ParsedTeammate[] {
  if (!record || totalWeight <= 0) return [];
  return Object.entries(record)
    .filter(([, v]) => v > 0)
    .map(([name, v]) => ({
      name: toCanonicalName(name),
      displayName: name,
      pct: round((v / totalWeight) * 100),
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, LIMITS.teammates);
}

/** Faz o parse de uma única entrada do chaos (sem rank — atribuído pelo chamador). */
export function parseChaosEntry(displayName: string, entry: ChaosEntry): ParsedUsageEntry {
  // Peso total = soma das abilities (cada set tem exatamente uma).
  const abilityTotal = Object.values(entry.Abilities ?? {}).reduce((a, b) => a + b, 0);
  const itemTotal = Object.values(entry.Items ?? {}).reduce((a, b) => a + b, 0);
  const totalWeight = abilityTotal > 0 ? abilityTotal : itemTotal;

  const { spreads, natures } = parseSpreads(entry.Spreads, totalWeight);

  return {
    name: toCanonicalName(displayName),
    displayName,
    usagePct: round((entry.usage ?? 0) * 100),
    rank: 0,
    rawCount: entry['Raw count'] ?? 0,
    abilities: topPcts(entry.Abilities, totalWeight, LIMITS.abilities),
    items: topPcts(entry.Items, totalWeight, LIMITS.items),
    natures,
    spreads,
    teraTypes: topPcts(entry['Tera Types'], totalWeight, LIMITS.tera),
    moves: topPcts(entry.Moves, totalWeight, LIMITS.moves),
    teammates: parseTeammates(entry.Teammates, totalWeight),
    checksAndCounters: parseChecks(entry['Checks and Counters']),
  };
}

/**
 * Faz o parse do arquivo chaos completo, ordenando por usage decrescente e
 * atribuindo `rank` (1 = mais usado).
 */
export function parseChaosFile(file: ChaosFile): ParsedUsageEntry[] {
  const entries = Object.entries(file.data)
    .map(([name, entry]) => parseChaosEntry(name, entry))
    .filter((e) => e.rawCount > 0 || e.usagePct > 0)
    .sort((a, b) => b.usagePct - a.usagePct);

  entries.forEach((e, i) => {
    e.rank = i + 1;
  });
  return entries;
}
