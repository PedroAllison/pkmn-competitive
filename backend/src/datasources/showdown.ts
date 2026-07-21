import { fetchJson } from './http.js';

/**
 * Datasource dos dados estáticos do Pokémon Showdown
 * (`play.pokemonshowdown.com/data/*.json`). Os arquivos são grandes e mudam
 * raramente, então ficam cacheados em memória por processo.
 */

const BASE = 'https://play.pokemonshowdown.com/data';

export interface ShowdownMove {
  name: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status';
  basePower: number;
  accuracy: number | true;
  pp: number;
}

export interface ShowdownPokedexEntry {
  name: string;
  num: number;
  types: string[];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: Record<string, string>;
}

export interface ShowdownItem {
  name: string;
  desc?: string;
}

export interface ShowdownAbility {
  name: string;
  desc?: string;
  shortDesc?: string;
}

type Cache = {
  pokedex?: Record<string, ShowdownPokedexEntry>;
  moves?: Record<string, ShowdownMove>;
  items?: Record<string, ShowdownItem>;
  abilities?: Record<string, ShowdownAbility>;
};

const cache: Cache = {};

/** Pokédex completa do Showdown (chaveada por id: "greattusk"). */
export async function getPokedex(): Promise<Record<string, ShowdownPokedexEntry>> {
  cache.pokedex ??= await fetchJson<Record<string, ShowdownPokedexEntry>>(`${BASE}/pokedex.json`);
  return cache.pokedex;
}

/** Moves do Showdown (chaveados por id: "headlongrush"). */
export async function getMoves(): Promise<Record<string, ShowdownMove>> {
  cache.moves ??= await fetchJson<Record<string, ShowdownMove>>(`${BASE}/moves.json`);
  return cache.moves;
}

/** Itens do Showdown (chaveados por id: "choiceband"). */
export async function getItems(): Promise<Record<string, ShowdownItem>> {
  cache.items ??= await fetchJson<Record<string, ShowdownItem>>(`${BASE}/items.json`);
  return cache.items;
}

/** Habilidades do Showdown (chaveadas por id: "protosynthesis"). */
export async function getAbilities(): Promise<Record<string, ShowdownAbility>> {
  cache.abilities ??= await fetchJson<Record<string, ShowdownAbility>>(`${BASE}/abilities.json`);
  return cache.abilities;
}

/** Limpa o cache em memória (usado em testes/sync forçado). */
export function clearShowdownCache(): void {
  delete cache.pokedex;
  delete cache.moves;
  delete cache.items;
  delete cache.abilities;
}
