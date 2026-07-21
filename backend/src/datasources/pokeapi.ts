import { fetchJson, FetchError } from './http.js';
import { getMoves } from './showdown.js';
import { toShowdownId, toDisplayName } from '../utils/format.js';
import type {
  AbilityInfo,
  BaseStats,
  EvolutionStep,
  LearnsetMove,
} from '../types/contract.js';

/**
 * Datasource da PokéAPI. Monta um Pokémon completo (species + pokemon +
 * evolution chain + learnset de gen 9) no shape usado pela tabela `pokemon`.
 * O learnset é enriquecido (tipo/categoria/poder) com o moves.json do
 * Showdown — evita centenas de requests por move na PokéAPI.
 */

const BASE = 'https://pokeapi.co/api/v2';

/* ---------- shapes mínimos das respostas da PokéAPI que consumimos ---------- */

interface ApiNamed {
  name: string;
  url: string;
}

interface ApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  stats: { base_stat: number; stat: ApiNamed }[];
  types: { slot: number; type: ApiNamed }[];
  abilities: { is_hidden: boolean; ability: ApiNamed }[];
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default: string | null } };
  };
  moves: {
    move: ApiNamed;
    version_group_details: {
      level_learned_at: number;
      move_learn_method: ApiNamed;
      version_group: ApiNamed;
    }[];
  }[];
  species: ApiNamed;
}

interface ApiSpecies {
  id: number;
  name: string;
  names: { language: ApiNamed; name: string }[];
  flavor_text_entries: { flavor_text: string; language: ApiNamed; version: ApiNamed }[];
  evolution_chain: { url: string } | null;
}

interface ApiEvoDetail {
  min_level: number | null;
  item: ApiNamed | null;
  trigger: ApiNamed | null;
  held_item: ApiNamed | null;
  time_of_day: string;
  min_happiness: number | null;
}

interface ApiChainLink {
  species: ApiNamed;
  evolution_details: ApiEvoDetail[];
  evolves_to: ApiChainLink[];
}

interface ApiEvolutionChain {
  chain: ApiChainLink;
}

/* ---------------------------------------------------------------------------- */

/** Pokémon completo pronto para persistir na tabela `pokemon`. */
export interface FullPokemon {
  id: number;
  name: string;
  displayName: string;
  dexNumber: number;
  types: string[];
  spriteUrl: string | null;
  artworkUrl: string | null;
  baseStats: BaseStats;
  height: number | null;
  weight: number | null;
  abilities: AbilityInfo[];
  evolutions: EvolutionStep[];
  learnset: LearnsetMove[];
  description: string | null;
}

const STAT_KEYS: Record<string, keyof BaseStats> = {
  hp: 'hp',
  attack: 'atk',
  defense: 'def',
  'special-attack': 'spa',
  'special-defense': 'spd',
  speed: 'spe',
};

/** Version groups considerados "gen 9" para o learnset. */
const GEN9_VERSION_GROUPS = new Set(['scarlet-violet']);

function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : 0;
}

function spriteById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function describeEvolution(d: ApiEvoDetail | undefined): string | null {
  if (!d) return null;
  const parts: string[] = [];
  if (d.min_level != null) parts.push(`nível ${d.min_level}`);
  if (d.item) parts.push(`usar ${toDisplayName(d.item.name)}`);
  if (d.held_item) parts.push(`segurando ${toDisplayName(d.held_item.name)}`);
  if (d.min_happiness != null) parts.push('amizade alta');
  if (d.time_of_day) parts.push(d.time_of_day === 'day' ? 'de dia' : 'à noite');
  if (parts.length === 0 && d.trigger) parts.push(toDisplayName(d.trigger.name));
  return parts.length ? parts.join(', ') : null;
}

function flattenChain(chain: ApiChainLink): EvolutionStep[] {
  const steps: EvolutionStep[] = [];
  const walk = (node: ApiChainLink): void => {
    const fromId = idFromUrl(node.species.url);
    for (const next of node.evolves_to) {
      const toId = idFromUrl(next.species.url);
      steps.push({
        fromId,
        toId,
        name: next.species.name,
        spriteUrl: spriteById(toId),
        condition: describeEvolution(next.evolution_details[0]),
      });
      walk(next);
    }
  };
  walk(chain);
  return steps;
}

async function buildLearnset(pokemon: ApiPokemon): Promise<LearnsetMove[]> {
  let showdownMoves: Awaited<ReturnType<typeof getMoves>> | null = null;
  try {
    showdownMoves = await getMoves();
  } catch {
    // Enriquecimento é opcional: sem o moves.json, o learnset sai sem tipo/categoria.
  }

  const learnset: LearnsetMove[] = [];
  for (const entry of pokemon.moves) {
    const detail = entry.version_group_details.find((d) =>
      GEN9_VERSION_GROUPS.has(d.version_group.name),
    );
    if (!detail) continue;
    const meta = showdownMoves?.[toShowdownId(entry.move.name)];
    learnset.push({
      move: meta?.name ?? toDisplayName(entry.move.name),
      type: meta?.type ?? null,
      category: meta?.category ?? null,
      power: meta && meta.basePower > 0 ? meta.basePower : null,
      accuracy: meta ? (meta.accuracy === true ? null : meta.accuracy) : null,
      pp: meta?.pp ?? null,
      method: detail.move_learn_method.name,
      level: detail.move_learn_method.name === 'level-up' ? detail.level_learned_at : null,
    });
  }
  learnset.sort((a, b) => (a.level ?? 999) - (b.level ?? 999) || a.move.localeCompare(b.move));
  return learnset;
}

function pickDescription(species: ApiSpecies): string | null {
  const entries = species.flavor_text_entries;
  const pick =
    entries.findLast((e) => e.language.name === 'pt-BR') ??
    entries.findLast((e) => e.language.name === 'en');
  return pick ? pick.flavor_text.replace(/[\n\f\r]+/g, ' ').trim() : null;
}

/**
 * Busca um Pokémon completo na PokéAPI (pokemon + species + evolution chain)
 * e monta o learnset de gen 9.
 * @throws {FetchError} com status 404 quando o Pokémon não existe.
 */
export async function fetchFullPokemon(idOrName: string | number): Promise<FullPokemon> {
  const key = String(idOrName).toLowerCase().trim();
  const pokemon = await fetchJson<ApiPokemon>(`${BASE}/pokemon/${encodeURIComponent(key)}`);
  const species = await fetchJson<ApiSpecies>(pokemon.species.url);

  let evolutions: EvolutionStep[] = [];
  if (species.evolution_chain) {
    try {
      const chain = await fetchJson<ApiEvolutionChain>(species.evolution_chain.url);
      evolutions = flattenChain(chain.chain);
    } catch {
      // Cadeia de evolução é acessória — segue sem ela.
    }
  }

  const baseStats: BaseStats = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  for (const s of pokemon.stats) {
    const k = STAT_KEYS[s.stat.name];
    if (k) baseStats[k] = s.base_stat;
  }

  const englishName =
    species.names.find((n) => n.language.name === 'en')?.name ?? toDisplayName(species.name);
  const formSuffix = pokemon.name.startsWith(`${species.name}-`)
    ? ` (${toDisplayName(pokemon.name.slice(species.name.length + 1))})`
    : '';

  return {
    id: pokemon.id,
    name: pokemon.name,
    displayName: `${englishName}${formSuffix}`,
    dexNumber: species.id,
    types: pokemon.types.sort((a, b) => a.slot - b.slot).map((t) => toDisplayName(t.type.name)),
    spriteUrl: pokemon.sprites.front_default ?? spriteById(pokemon.id),
    artworkUrl: pokemon.sprites.other?.['official-artwork']?.front_default ?? null,
    baseStats,
    height: pokemon.height / 10, // decímetros → metros
    weight: pokemon.weight / 10, // hectogramas → kg
    abilities: pokemon.abilities.map((a) => ({
      name: toDisplayName(a.ability.name),
      isHidden: a.is_hidden,
      description: null, // descrição é enriquecida pelo job de pokedex via abilities.json
    })),
    evolutions,
    learnset: await buildLearnset(pokemon),
    description: pickDescription(species),
  };
}

export { FetchError };
