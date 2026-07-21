import { getPool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { fetchFullPokemon, type FullPokemon } from '../datasources/pokeapi.js';
import { FetchError } from '../datasources/http.js';
import { fetchFormatUsage } from '../datasources/smogonStats.js';
import type { ParsedUsageEntry } from '../datasources/smogonChaos.js';
import { computeDifficulty } from './difficulty.js';
import { generateStrategyText } from './strategyText.js';
import * as usageService from './usageService.js';
import * as formatService from './formatService.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { showdownSpriteUrl, toDisplayName } from '../utils/format.js';
import type {
  AbilityInfo,
  BaseStats,
  CheckCounter,
  CompetitiveData,
  EvolutionStep,
  LearnsetMove,
  Paginated,
  PokemonDetail,
  PokemonSummary,
  TeammateInfo,
} from '../types/contract.js';

/**
 * Service de Pokémon com estratégia **db-first, fetch-on-miss**: se o Pokémon
 * (ou seus dados competitivos) não está no banco, busca na fonte externa
 * (PokéAPI / Smogon), persiste e responde.
 */

interface PokemonRow {
  id: number;
  name: string;
  display_name: string;
  dex_number: number;
  types: string[];
  sprite_url: string | null;
  artwork_url: string | null;
  base_stats: BaseStats;
  height: string | null;
  weight: string | null;
  abilities: AbilityInfo[];
  evolutions: EvolutionStep[];
  learnset: LearnsetMove[];
  description: string | null;
  usage_pct?: string | null;
  usage_rank?: number | null;
}

export interface ListPokemonOptions {
  search?: string;
  type?: string;
  format?: string;
  /** Jogo (`champions`|`sv`|`legends-za`) — usado quando `format` não é informado. */
  game?: string;
  page: number;
  limit: number;
}

function toSummary(row: PokemonRow): PokemonSummary {
  return {
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    dexNumber: row.dex_number,
    types: row.types,
    spriteUrl: row.sprite_url,
    artworkUrl: row.artwork_url,
    baseStats: row.base_stats,
    usagePct: row.usage_pct != null ? Number(row.usage_pct) : null,
    usageRank: row.usage_rank ?? null,
  };
}

function toDetail(row: PokemonRow): PokemonDetail {
  return {
    ...toSummary(row),
    height: row.height != null ? Number(row.height) : null,
    weight: row.weight != null ? Number(row.weight) : null,
    abilities: row.abilities ?? [],
    evolutions: row.evolutions ?? [],
    learnset: row.learnset ?? [],
    description: row.description,
  };
}

/** Persiste (upsert) um Pokémon completo vindo da PokéAPI. */
export async function upsertPokemon(p: FullPokemon): Promise<void> {
  await getPool().query(
    `INSERT INTO pokemon (id, name, display_name, dex_number, types, sprite_url, artwork_url,
                          base_stats, height, weight, abilities, evolutions, learnset, description, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, display_name = EXCLUDED.display_name,
       dex_number = EXCLUDED.dex_number, types = EXCLUDED.types,
       sprite_url = EXCLUDED.sprite_url, artwork_url = EXCLUDED.artwork_url,
       base_stats = EXCLUDED.base_stats, height = EXCLUDED.height, weight = EXCLUDED.weight,
       abilities = EXCLUDED.abilities, evolutions = EXCLUDED.evolutions,
       learnset = EXCLUDED.learnset, description = EXCLUDED.description, updated_at = now()`,
    [
      p.id,
      p.name,
      p.displayName,
      p.dexNumber,
      p.types,
      p.spriteUrl,
      p.artworkUrl,
      JSON.stringify(p.baseStats),
      p.height,
      p.weight,
      JSON.stringify(p.abilities),
      JSON.stringify(p.evolutions),
      JSON.stringify(p.learnset),
      p.description,
    ],
  );
}

/**
 * Lista Pokémon com filtros de busca/tipo e paginação.
 *
 * Só retorna Pokémon com dados de uso reais (INNER JOIN) — ou seja, "os
 * mais usados", nunca a Pokédex completa misturada com espécies que não
 * jogam no formato/jogo escolhido:
 * - `format` informado: usage/rank do mês mais recente daquele formato
 *   exato, ordenado por rank.
 * - sem `format` mas com `game`: agrega o melhor rank entre todos os
 *   formatos daquele jogo (ex.: Champions = VGC + BSS + Champions OU...),
 *   ordenado pelo melhor rank.
 * - nem `format` nem `game`: lista a Pokédex completa em ordem de dex
 *   (fallback só usado internamente, a API sempre envia `game`).
 */
export async function listPokemon(opts: ListPokemonOptions): Promise<Paginated<PokemonSummary>> {
  const params: unknown[] = [];
  const where: string[] = [];
  let joinUsage = '';
  let orderBy = 'p.dex_number, p.id';
  let usageSelect = 'NULL AS usage_pct, NULL AS usage_rank,';

  if (opts.format) {
    params.push(opts.format);
    const fmtIdx = params.length;
    joinUsage = `
      JOIN pokemon_usage u
        ON u.pokemon_name = p.name AND u.format_id = $${fmtIdx}
       AND u.month = (SELECT MAX(month) FROM pokemon_usage x WHERE x.format_id = $${fmtIdx})`;
    orderBy = 'u.rank ASC';
    usageSelect = 'u.usage_pct, u.rank AS usage_rank,';
  } else if (opts.game) {
    params.push(opts.game);
    const gameIdx = params.length;
    joinUsage = `
      JOIN (
        SELECT u.pokemon_name, MIN(u.rank) AS best_rank, MAX(u.usage_pct) AS best_pct
          FROM pokemon_usage u
          JOIN formats f ON f.id = u.format_id
         WHERE f.game = $${gameIdx}
           AND u.month = (SELECT MAX(month) FROM pokemon_usage x WHERE x.format_id = u.format_id)
         GROUP BY u.pokemon_name
      ) u ON u.pokemon_name = p.name`;
    orderBy = 'u.best_rank ASC';
    usageSelect = 'u.best_pct AS usage_pct, u.best_rank AS usage_rank,';
  }

  if (opts.search) {
    params.push(`%${opts.search}%`);
    where.push(`(p.name ILIKE $${params.length} OR p.display_name ILIKE $${params.length})`);
  }
  if (opts.type) {
    params.push(opts.type);
    where.push(
      `EXISTS (SELECT 1 FROM unnest(p.types) AS t WHERE lower(t) = lower($${params.length}))`,
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  params.push(opts.limit, (opts.page - 1) * opts.limit);

  const sql = `
    SELECT p.*, ${usageSelect}
           COUNT(*) OVER() AS total_count
      FROM pokemon p
      ${joinUsage}
      ${whereSql}
     ORDER BY ${orderBy}
     LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const { rows } = await getPool().query<PokemonRow & { total_count: string }>(sql, params);
  return {
    items: rows.map(toSummary),
    total: rows.length > 0 ? Number(rows[0].total_count) : 0,
  };
}

async function findRow(idOrName: string): Promise<PokemonRow | null> {
  const key = idOrName.toLowerCase().trim();
  const { rows } = await getPool().query<PokemonRow>(
    `SELECT * FROM pokemon
      WHERE name = $1 OR ($1 ~ '^[0-9]+$' AND (id = $1::int OR dex_number = $1::int))
      ORDER BY (name = $1) DESC, id
      LIMIT 1`,
    [key],
  );
  return rows[0] ?? null;
}

/**
 * Busca um Pokémon por id ou nome. db-first: em cache miss, busca a ficha
 * completa na PokéAPI, persiste e responde.
 * @throws {HttpError} 404 se não existe nem na PokéAPI.
 */
export async function getPokemonDetail(idOrName: string): Promise<PokemonDetail> {
  const row = await findRow(idOrName);
  if (row) return toDetail(row);

  logger.info({ idOrName }, 'Pokémon fora do banco — buscando na PokéAPI');
  let full: FullPokemon;
  try {
    full = await fetchFullPokemon(idOrName);
  } catch (err) {
    if (err instanceof FetchError && err.status === 404) {
      throw notFound(`Pokémon "${idOrName}" não encontrado`);
    }
    throw err;
  }
  await upsertPokemon(full);
  const fresh = await findRow(String(full.id));
  if (!fresh) throw new HttpError(500, 'INTERNAL_ERROR', 'Falha ao persistir Pokémon');
  return toDetail(fresh);
}

/**
 * Enriquece nomes de teammates/checks com display/sprite do banco (fallback:
 * sprite do Showdown) e com o item mais usado por cada um no mesmo
 * formato/mês (o chaos do Smogon já traz um `ChaosEntry`/`Items` próprio
 * para cada Pokémon do formato — inclusive formas mega, ex.: Charizard-Mega-Y
 * aparece com a Charizardite Y como item mais usado).
 */
async function enrichPokemonRefs(
  entry: ParsedUsageEntry,
  format: string,
  month: string,
): Promise<{ teammates: TeammateInfo[]; checks: CheckCounter[] }> {
  const names = [
    ...entry.teammates.map((t) => t.name),
    ...entry.checksAndCounters.map((c) => c.name),
  ];
  const known = new Map<string, { display_name: string; sprite_url: string | null }>();
  if (names.length > 0) {
    const { rows } = await getPool().query<{
      name: string;
      display_name: string;
      sprite_url: string | null;
    }>('SELECT name, display_name, sprite_url FROM pokemon WHERE name = ANY($1)', [names]);
    for (const r of rows) known.set(r.name, r);
  }

  // Fetch-on-miss: qualquer teammate/check ainda não visto (ex.: forma
  // mega/alt citada só nas usage stats, nunca aberta na Pokédex) é buscado
  // na PokéAPI e persistido, para ganhar sprite/artwork reais em vez de só o
  // fallback estático do Showdown. Se a PokéAPI também não conhecer a forma
  // (ex.: mega exclusiva do Champions, sem equivalente no jogo principal),
  // segue para o fallback do Showdown/placeholder no frontend.
  //
  // Feito com baixa concorrência (3 por vez) e timeout curto por item: é um
  // enriquecimento best-effort, não pode disparar 10+ fetches multi-request
  // em paralelo na PokéAPI (isso já causou "fetch failed" em cascata,
  // afetando até requisições sem relação nenhuma, provavelmente por
  // rate-limit/exaustão de conexões).
  const missing = names.filter((n) => !known.has(n));
  const ENRICH_CONCURRENCY = 3;
  const ENRICH_TIMEOUT_MS = 4000;
  for (let i = 0; i < missing.length; i += ENRICH_CONCURRENCY) {
    const batch = missing.slice(i, i + ENRICH_CONCURRENCY);
    await Promise.all(
      batch.map(async (n) => {
        try {
          const full = await Promise.race([
            fetchFullPokemon(n),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), ENRICH_TIMEOUT_MS),
            ),
          ]);
          await upsertPokemon(full);
          known.set(n, { display_name: full.displayName, sprite_url: full.spriteUrl });
        } catch (err) {
          if (!(err instanceof FetchError && err.status === 404)) {
            logger.warn({ err: (err as Error).message, name: n }, 'Falha ao enriquecer teammate/check');
          }
        }
      }),
    );
  }

  const topItems = await usageService.getTopItems(format, month, names);

  const teammates: TeammateInfo[] = entry.teammates.map((t) => ({
    name: t.name,
    displayName: known.get(t.name)?.display_name ?? t.displayName ?? toDisplayName(t.name),
    spriteUrl: known.get(t.name)?.sprite_url ?? showdownSpriteUrl(t.name),
    item: topItems.get(t.name) ?? null,
    pct: t.pct,
  }));

  const checks: CheckCounter[] = entry.checksAndCounters.map((c) => ({
    ...c,
    displayName: known.get(c.name)?.display_name ?? c.displayName ?? toDisplayName(c.name),
    spriteUrl: known.get(c.name)?.sprite_url ?? showdownSpriteUrl(c.name),
    item: topItems.get(c.name) ?? null,
  }));

  return { teammates, checks };
}

/**
 * Dados competitivos de um Pokémon em um formato (mês mais recente).
 * db-first: sem dados no banco, baixa o chaos do Smogon sob demanda,
 * persiste o formato inteiro e responde. `difficulty` e `strategyText`
 * são computados no momento da leitura.
 */
export async function getCompetitiveData(
  idOrName: string,
  format: string,
): Promise<CompetitiveData> {
  if (!(await formatService.formatExists(format))) {
    throw notFound(`Formato "${format}" não encontrado`);
  }

  const detail = await getPokemonDetail(idOrName);
  let row = await usageService.getUsageRow(format, detail.name);

  if (!row) {
    logger.info({ format, name: detail.name }, 'Usage fora do banco — buscando no Smogon');
    try {
      const usage = await fetchFormatUsage(format);
      await usageService.upsertUsageEntries(format, usage.month, usage.entries);
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'Falha no fetch-on-miss do Smogon');
    }
    row = await usageService.getUsageRow(format, detail.name);
  }

  if (!row) {
    throw notFound(`Sem dados competitivos de "${detail.displayName}" em ${format}`);
  }

  const entry = row.data;
  const { teammates, checks } = await enrichPokemonRefs(entry, format, row.month);

  return {
    format,
    month: row.month,
    usagePct: Number(row.usage_pct),
    usageRank: row.rank,
    rawCount: row.raw_count,
    abilities: entry.abilities,
    items: entry.items,
    natures: entry.natures,
    spreads: entry.spreads,
    teraTypes: entry.teraTypes,
    moves: entry.moves,
    teammates,
    checksAndCounters: checks,
    difficulty: computeDifficulty({
      spreads: entry.spreads,
      items: entry.items,
      moves: entry.moves,
    }),
    strategyText: generateStrategyText({
      displayName: detail.displayName,
      spreads: entry.spreads,
      items: entry.items,
      moves: entry.moves,
      teraTypes: entry.teraTypes,
      abilities: entry.abilities,
    }),
  };
}

/** Top N Pokémon por rank de usage em um formato (mês mais recente). */
export async function getTopUsage(format: string, limit: number): Promise<PokemonSummary[]> {
  const { rows } = await getPool().query<PokemonRow>(
    `SELECT p.*, u.usage_pct, u.rank AS usage_rank
       FROM pokemon_usage u
       JOIN pokemon p ON p.name = u.pokemon_name
      WHERE u.format_id = $1
        AND u.month = (SELECT MAX(month) FROM pokemon_usage x WHERE x.format_id = $1)
      ORDER BY u.rank
      LIMIT $2`,
    [format, limit],
  );
  return rows.map(toSummary);
}
