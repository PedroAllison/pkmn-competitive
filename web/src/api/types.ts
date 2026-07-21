/**
 * Tipos do contrato da API REST v1 do backend.
 *
 * Espelha `docs/API_CONTRACT.md` — mantenha os dois em sincronia quando o
 * contrato mudar.
 */

/** Envelope padrão de sucesso. */
export interface ApiEnvelope<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/** Envelope padrão de erro. */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

export interface Health {
  status: 'ok';
  db: boolean;
  redis: boolean;
}

export type GameType = 'singles' | 'doubles';

/**
 * Jogo ao qual um formato pertence (ver docs/API_CONTRACT.md). Escopo do
 * produto é apenas Pokémon Champions — mantido como tipo só para deixar
 * explícito no contrato.
 */
export type CompetitiveGame = 'champions';

export interface Format {
  id: string;
  label: string;
  gameType: GameType;
  generation: number;
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
  /** PK do banco (numérico — não confundir com `name`, usado nas rotas). */
  id: number;
  name: string;
  displayName: string;
  dexNumber: number;
  types: string[];
  spriteUrl: string;
  artworkUrl: string;
  baseStats: BaseStats;
  usagePct: number | null;
  usageRank: number | null;
}

export interface TeamPokemonRef {
  name: string;
  displayName: string;
  spriteUrl: string;
  item: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  format: string;
  author: string;
  event: string | null;
  placement: string | null;
  dateISO: string;
  pokemon: TeamPokemonRef[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  dateISO: string;
  summary: string;
  tag: 'vgc' | 'smogon' | 'event' | 'general';
}
