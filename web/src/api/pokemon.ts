import { apiGet } from './client';
import type { PokemonSummary } from './types';

/** Detalhe completo de um Pokémon (`GET /pokemon/:idOrName`). */
export interface PokemonDetail extends PokemonSummary {
  height: number;
  weight: number;
  abilities: { name: string; isHidden: boolean; description: string }[];
  evolutions: { fromId: string; toId: string; name: string; spriteUrl: string; condition: string }[];
  learnset: {
    move: string;
    type: string;
    category: string;
    power: number | null;
    accuracy: number | null;
    pp: number;
    method: string;
    level: number | null;
  }[];
  description: string;
}

export interface CompetitiveNamedPct {
  name: string;
  pct: number;
}

export interface CompetitiveSpread {
  nature: string;
  evs: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  pct: number;
}

export interface CompetitiveTeammate {
  name: string;
  displayName: string;
  spriteUrl: string;
  /** Item mais usado por esse parceiro no mesmo formato/mês (ex.: mega stone de uma forma mega). */
  item: string | null;
  pct: number;
}

export interface CompetitiveCheckCounter {
  name: string;
  displayName: string;
  spriteUrl: string;
  item: string | null;
  koPct: number;
  switchPct: number;
  score: number;
  kind: 'counter' | 'check';
}

/** `GET /pokemon/:idOrName/competitive` — dados de uso competitivo. */
export interface CompetitiveData {
  format: string;
  month: string;
  usagePct: number;
  usageRank: number;
  rawCount: number;
  abilities: CompetitiveNamedPct[];
  items: CompetitiveNamedPct[];
  natures: CompetitiveNamedPct[];
  spreads: CompetitiveSpread[];
  teraTypes: CompetitiveNamedPct[];
  moves: CompetitiveNamedPct[];
  teammates: CompetitiveTeammate[];
  checksAndCounters: CompetitiveCheckCounter[];
  difficulty: 'easy' | 'medium' | 'hard';
  strategyText: string | null;
}

export interface ListPokemonParams {
  search?: string;
  type?: string;
  format?: string;
  /** Jogo (`champions`|`sv`|`legends-za`) — usado quando `format` não é informado. */
  game?: string;
  page?: number;
  limit?: number;
}

export async function listPokemon(params: ListPokemonParams) {
  return apiGet<PokemonSummary[]>('/pokemon', {
    search: params.search,
    type: params.type,
    format: params.format,
    game: params.game,
    page: params.page,
    limit: params.limit,
  });
}

export async function getPokemonDetail(idOrName: string) {
  return apiGet<PokemonDetail>(`/pokemon/${encodeURIComponent(idOrName)}`);
}

export async function getCompetitiveData(idOrName: string, format: string) {
  return apiGet<CompetitiveData>(`/pokemon/${encodeURIComponent(idOrName)}/competitive`, { format });
}

export async function getTopUsage(format: string, limit = 12) {
  return apiGet<PokemonSummary[]>('/usage/top', { format, limit });
}
