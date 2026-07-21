/**
 * Tipos do contrato de API v1 (docs/API_CONTRACT.md).
 * Toda resposta usa o envelope `{ data, meta? }`; erros usam `{ error: { code, message } }`.
 */

/**
 * Jogo ao qual um formato pertence. Escopo do produto é **apenas Pokémon
 * Champions** (confirmado como o software oficial de VGC para Worlds 2026
 * em champions.pokemon.com/en-us/gameplay/) — o tipo fica como union de um
 * valor só para deixar explícito no contrato, e para caso o produto volte
 * a cobrir outros jogos no futuro.
 */
export type CompetitiveGame = 'champions';

export interface Format {
  id: string;
  label: string;
  gameType: 'singles' | 'doubles';
  generation: number;
  /** Jogo competitivo — sempre `champions` no escopo atual. */
  game: CompetitiveGame;
}

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonSummary {
  id: number;
  name: string;
  displayName: string;
  dexNumber: number;
  types: string[];
  spriteUrl: string | null;
  artworkUrl: string | null;
  baseStats: BaseStats;
  /** Preenchido apenas quando um `format` é informado na query. */
  usagePct: number | null;
  usageRank: number | null;
}

export interface AbilityInfo {
  name: string;
  isHidden: boolean;
  description: string | null;
}

export interface EvolutionStep {
  fromId: number | null;
  toId: number;
  name: string;
  spriteUrl: string | null;
  condition: string | null;
}

export interface LearnsetMove {
  move: string;
  type: string | null;
  category: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  method: string;
  level: number | null;
}

export interface PokemonDetail extends PokemonSummary {
  height: number | null;
  weight: number | null;
  abilities: AbilityInfo[];
  evolutions: EvolutionStep[];
  learnset: LearnsetMove[];
  description: string | null;
}

export interface NamedPct {
  name: string;
  pct: number;
}

export interface Spread {
  nature: string;
  evs: BaseStats;
  pct: number;
}

export interface TeammateInfo {
  name: string;
  displayName: string;
  spriteUrl: string | null;
  /** Item mais usado por esse Pokémon no mesmo formato/mês (ex.: mega stone de uma forma mega). */
  item: string | null;
  pct: number;
}

export type CheckKind = 'counter' | 'check';

export interface CheckCounter {
  name: string;
  displayName: string;
  spriteUrl: string | null;
  /** Item mais usado por esse Pokémon no mesmo formato/mês. */
  item: string | null;
  koPct: number;
  switchPct: number;
  score: number;
  kind: CheckKind;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CompetitiveData {
  format: string;
  month: string;
  usagePct: number;
  usageRank: number;
  rawCount: number;
  abilities: NamedPct[];
  items: NamedPct[];
  natures: NamedPct[];
  spreads: Spread[];
  teraTypes: NamedPct[];
  moves: NamedPct[];
  teammates: TeammateInfo[];
  checksAndCounters: CheckCounter[];
  difficulty: Difficulty;
  strategyText: string | null;
}

export interface TeamMember {
  name: string;
  displayName: string;
  spriteUrl: string | null;
  item: string | null;
}

export interface TeamSummary {
  id: string;
  name: string;
  format: string;
  author: string;
  event: string | null;
  placement: string | null;
  dateISO: string;
  pokemon: TeamMember[];
}

export interface TeamDetail extends TeamSummary {
  showdownPaste: string;
  strategy: string | null;
  leadGuide: string | null;
  sourceUrl: string | null;
}

export type NewsTag = 'vgc' | 'smogon' | 'event' | 'general';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  dateISO: string;
  summary: string | null;
  tag: NewsTag;
}

export type SyncJobName = 'usage' | 'pokedex' | 'teams' | 'news' | 'all';

export interface SyncStatusEntry {
  job: string;
  lastRunISO: string;
  status: 'running' | 'success' | 'error';
  message: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}
