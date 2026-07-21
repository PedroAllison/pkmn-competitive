import { fetchJson, fetchText, FetchError } from './http.js';
import { getAbilities, getItems, getMoves } from './showdown.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { toShowdownId } from '../utils/format.js';
import { parseChaosFile, type ChaosFile, type ParsedUsageEntry } from './smogonChaos.js';

/**
 * Datasource dos usage stats do Smogon (`smogon.com/stats`).
 *
 * Resolução de mês: os stats do mês M são publicados nos primeiros dias de
 * M+1, então tentamos do mês anterior para trás (até 14 meses) até achar um
 * diretório existente. O resultado fica cacheado em memória por 6h.
 *
 * Resolução de formato → arquivo:
 * - Escopo **apenas Pokémon Champions** (jogo `champions`). Os ids já usam o
 *   nome real da regulation publicada pelo Smogon como prefixo exato (ex.:
 *   `gen9championsvgc2026regmb`), confirmado em
 *   `smogon.com/stats/<mês>/chaos/` — sem necessidade de resolver sufixo,
 *   mas o mesmo mecanismo de busca por prefixo continua valendo caso o
 *   Smogon publique uma variante com sufixo extra no futuro.
 * - Baseline: tenta `SMOGON_BASELINE` (default 1760) e cai para os demais
 *   baselines disponíveis na listagem (1825/1695/1630/1500/0).
 */

const STATS_BASE = 'https://www.smogon.com/stats';

/** Prefixos de busca por formato canônico do contrato (só Pokémon Champions). */
const FORMAT_PREFIXES: Record<string, string> = {
  gen9championsvgc2026regmb: 'gen9championsvgc2026regmb',
  gen9championsvgc2026regma: 'gen9championsvgc2026regma',
  gen9championsvgc2026regmbbo3: 'gen9championsvgc2026regmbbo3',
  gen9championsvgc2026regmabo3: 'gen9championsvgc2026regmabo3',
  gen9championsbssregmb: 'gen9championsbssregmb',
  gen9championsbssregma: 'gen9championsbssregma',
  gen9championsou: 'gen9championsou',
  gen9champions4v4doublesuu: 'gen9champions4v4doublesuu',
};

const BASELINE_FALLBACKS = [1825, 1760, 1695, 1630, 1500, 0];

interface ResolvedStats {
  month: string;
  fileName: string;
  url: string;
}

let monthCache: { month: string; expiresAt: number } | null = null;
const listingCache = new Map<string, string[]>();

function formatMonth(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Resolve o mês mais recente com stats publicados, regredindo a partir do
 * mês atual. Cacheado por 6h.
 */
export async function resolveLatestMonth(): Promise<string> {
  if (monthCache && monthCache.expiresAt > Date.now()) return monthCache.month;

  const now = new Date();
  for (let back = 0; back < 14; back++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    const month = formatMonth(d);
    try {
      await fetchText(`${STATS_BASE}/${month}/`, { retries: 1, timeoutMs: 15_000 });
      monthCache = { month, expiresAt: Date.now() + 6 * 3600_000 };
      logger.info({ month }, 'Mês de usage stats do Smogon resolvido');
      return month;
    } catch (err) {
      if (err instanceof FetchError && err.status === 404) continue;
      // Erro de rede/5xx: tenta o mês anterior mesmo assim.
    }
  }
  throw new Error('Não foi possível resolver um mês de stats do Smogon nos últimos 14 meses');
}

/** Lista os arquivos `.json` do diretório chaos de um mês (com cache). */
async function listChaosFiles(month: string): Promise<string[]> {
  const cached = listingCache.get(month);
  if (cached) return cached;
  const html = await fetchText(`${STATS_BASE}/${month}/chaos/`, { retries: 2 });
  const files = [...html.matchAll(/href="([^"]+\.json)"/g)].map((m) => m[1]);
  listingCache.set(month, files);
  return files;
}

/**
 * Resolve o arquivo chaos para um formato canônico do contrato.
 * Preferências: baseline configurado > baselines de fallback; sufixo de
 * regulation mais recente; variantes sem `bo3` primeiro.
 */
export async function resolveChaosFile(formatId: string, month: string): Promise<ResolvedStats> {
  const prefix = FORMAT_PREFIXES[formatId];
  if (!prefix) throw new Error(`Formato desconhecido para o Smogon: ${formatId}`);

  const files = await listChaosFiles(month);
  const re = new RegExp(`^(${prefix}[a-z0-9]*)-(\\d+)\\.json$`);
  const candidates = files
    .map((f) => {
      const m = f.match(re);
      return m ? { fileName: f, name: m[1], baseline: Number(m[2]) } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    // Evita capturar formatos que apenas começam com o prefixo (ex.: gen9uu × gen9uubers não existe,
    // mas gen9nationaldex × gen9nationaldexubers sim): exige nome exato ou sufixo de regulation curto.
    .filter((c) => c.name === prefix || /^(reg[a-z0-9]*|bo3|series\d*)$/.test(c.name.slice(prefix.length)));

  if (candidates.length === 0) {
    throw new Error(`Nenhum arquivo chaos para ${formatId} em ${month}`);
  }

  // Nome "melhor": regulation mais recente (ordem lexicográfica), sem bo3 de preferência.
  const bestName = [...new Set(candidates.map((c) => c.name))].sort((a, b) => {
    const aBo3 = a.includes('bo3') ? 1 : 0;
    const bBo3 = b.includes('bo3') ? 1 : 0;
    if (aBo3 !== bBo3) return aBo3 - bBo3;
    return b.localeCompare(a);
  })[0];

  const ofBest = candidates.filter((c) => c.name === bestName);
  const baselines = [env.SMOGON_BASELINE, ...BASELINE_FALLBACKS];
  for (const b of baselines) {
    const hit = ofBest.find((c) => c.baseline === b);
    if (hit) {
      return { month, fileName: hit.fileName, url: `${STATS_BASE}/${month}/chaos/${hit.fileName}` };
    }
  }
  // Último recurso: qualquer baseline do melhor nome.
  const any = ofBest[0];
  return { month, fileName: any.fileName, url: `${STATS_BASE}/${month}/chaos/${any.fileName}` };
}

/**
 * Converte ids do Smogon/Showdown em nomes de exibição usando os dados
 * estáticos do Showdown (ex.: "headlongrush" → "Headlong Rush"). Best-effort:
 * sem rede, mantém o id original.
 */
async function prettifyEntries(entries: ParsedUsageEntry[]): Promise<void> {
  try {
    const [moves, items, abilities] = await Promise.all([getMoves(), getItems(), getAbilities()]);
    const pretty = (dict: Record<string, { name: string }>, id: string): string =>
      dict[toShowdownId(id)]?.name ?? id;
    for (const e of entries) {
      e.moves = e.moves.map((m) => ({ ...m, name: pretty(moves, m.name) }));
      e.items = e.items.map((i) => ({ ...i, name: pretty(items, i.name) }));
      e.abilities = e.abilities.map((a) => ({ ...a, name: pretty(abilities, a.name) }));
    }
  } catch (err) {
    logger.warn({ err: (err as Error).message }, 'Falha ao embelezar nomes via Showdown data');
  }
}

export interface FormatUsage {
  month: string;
  fileName: string;
  entries: ParsedUsageEntry[];
}

/**
 * Baixa e transforma o chaos de um formato no mês mais recente disponível.
 */
export async function fetchFormatUsage(formatId: string): Promise<FormatUsage> {
  const month = await resolveLatestMonth();
  const resolved = await resolveChaosFile(formatId, month);
  logger.info({ formatId, url: resolved.url }, 'Baixando usage stats do Smogon');
  const file = await fetchJson<ChaosFile>(resolved.url, { timeoutMs: 120_000 });
  const entries = parseChaosFile(file);
  await prettifyEntries(entries);
  return { month, fileName: resolved.fileName, entries };
}

/** Limpa caches em memória (testes). */
export function clearSmogonCache(): void {
  monthCache = null;
  listingCache.clear();
}
