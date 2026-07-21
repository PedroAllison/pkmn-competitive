import { fetchFullPokemon } from '../datasources/pokeapi.js';
import { getAbilities } from '../datasources/showdown.js';
import { upsertPokemon } from '../services/pokemonService.js';
import { getTopUsedNames } from '../services/usageService.js';
import { mapLimit } from '../utils/async.js';
import { toShowdownId } from '../utils/format.js';
import { logger } from '../config/logger.js';

const TOP_POKEMON_COUNT = 300;
const CONCURRENCY = 5;

/**
 * Job `pokedex`: garante a ficha completa (PokéAPI) dos ~300 Pokémon mais
 * usados nos formatos sincronizados. O restante entra sob demanda via
 * fetch-on-miss do pokemonService. Descrições de habilidade são enriquecidas
 * com o abilities.json do Showdown.
 */
export async function runPokedexSync(): Promise<string> {
  const names = await getTopUsedNames(TOP_POKEMON_COUNT);
  if (names.length === 0) {
    return 'Nenhum usage no banco ainda — rode o job "usage" primeiro';
  }

  let abilitiesDex: Awaited<ReturnType<typeof getAbilities>> | null = null;
  try {
    abilitiesDex = await getAbilities();
  } catch {
    abilitiesDex = null;
  }

  let ok = 0;
  let failed = 0;
  await mapLimit(
    names,
    CONCURRENCY,
    async (name) => {
      const full = await fetchFullPokemon(name);
      if (abilitiesDex) {
        full.abilities = full.abilities.map((a) => ({
          ...a,
          description:
            abilitiesDex[toShowdownId(a.name)]?.shortDesc ??
            abilitiesDex[toShowdownId(a.name)]?.desc ??
            a.description,
        }));
      }
      await upsertPokemon(full);
      ok += 1;
    },
    (name, err) => {
      failed += 1;
      logger.warn({ name, err: (err as Error).message }, 'Falha ao sincronizar Pokémon');
    },
  );
  return `${ok} Pokémon sincronizados, ${failed} falhas (top ${names.length} por usage)`;
}
