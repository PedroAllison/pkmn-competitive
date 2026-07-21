import { toShowdownId } from '../utils/format.js';
import type { Difficulty, NamedPct, Spread } from '../types/contract.js';

/**
 * Heurística determinística de dificuldade de pilotagem de um Pokémon,
 * calculada a partir dos usage stats:
 *
 * +1 se há ≥3 spreads viáveis (≥5% de uso) — exige conhecer as variantes;
 * +1 se há ≥5 spreads viáveis;
 * +1 se o Pokémon roda papéis mistos (spread ofensivo E defensivo, ambos ≥10%)
 *    — a leitura do set do oponente/o piloto do próprio set fica ambígua;
 * +1 se depende de itens Choice/lock (≥40% somado) — exige previsão de troca;
 * +1 se depende de setup (moves de boost somando ≥40%) — exige criar a
 *    janela de setup sem ser punido.
 *
 * 0–1 → easy · 2–3 → medium · 4–5 → hard
 */

export interface DifficultyInput {
  spreads: Spread[];
  items: NamedPct[];
  moves: NamedPct[];
}

const CHOICE_ITEMS = new Set(['choiceband', 'choicespecs', 'choicescarf', 'assaultvest']);

const SETUP_MOVES = new Set([
  'swordsdance',
  'nastyplot',
  'calmmind',
  'dragondance',
  'bulkup',
  'irondefense',
  'shellsmash',
  'quiverdance',
  'agility',
  'bellydrum',
  'curse',
  'shiftgear',
  'victorydance',
  'tidyup',
  'honeclaws',
  'filletaway',
]);

const VIABLE_SPREAD_PCT = 5;
const ROLE_SPREAD_PCT = 10;

function isOffensive(s: Spread): boolean {
  return s.evs.atk >= 200 || s.evs.spa >= 200;
}

function isDefensive(s: Spread): boolean {
  return s.evs.hp >= 200 && (s.evs.def >= 100 || s.evs.spd >= 100 || s.evs.atk + s.evs.spa < 100);
}

/** Calcula a dificuldade a partir de spreads/itens/moves normalizados. */
export function computeDifficulty(input: DifficultyInput): Difficulty {
  let score = 0;

  const viable = input.spreads.filter((s) => s.pct >= VIABLE_SPREAD_PCT);
  if (viable.length >= 3) score += 1;
  if (viable.length >= 5) score += 1;

  const relevant = input.spreads.filter((s) => s.pct >= ROLE_SPREAD_PCT);
  const mixedRoles = relevant.some(isOffensive) && relevant.some(isDefensive);
  if (mixedRoles) score += 1;

  const choicePct = input.items
    .filter((i) => CHOICE_ITEMS.has(toShowdownId(i.name)))
    .reduce((sum, i) => sum + i.pct, 0);
  if (choicePct >= 40) score += 1;

  const setupPct = input.moves
    .filter((m) => SETUP_MOVES.has(toShowdownId(m.name)))
    .reduce((sum, m) => sum + m.pct, 0);
  if (setupPct >= 40) score += 1;

  if (score <= 1) return 'easy';
  if (score <= 3) return 'medium';
  return 'hard';
}
