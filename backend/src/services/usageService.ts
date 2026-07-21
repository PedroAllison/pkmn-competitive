import { getPool } from '../config/db.js';
import type { ParsedUsageEntry } from '../datasources/smogonChaos.js';

/**
 * Repositório da tabela `pokemon_usage` (uma linha por Pokémon × formato ×
 * mês; o jsonb `data` guarda o ParsedUsageEntry completo: moves, items,
 * spreads, teammates, checks, tera).
 */

export interface UsageRow {
  pokemon_name: string;
  format_id: string;
  month: string;
  usage_pct: string;
  rank: number;
  raw_count: number;
  data: ParsedUsageEntry;
}

/** Último mês com dados para um formato (null se nunca sincronizado). */
export async function getLatestMonth(formatId: string): Promise<string | null> {
  const { rows } = await getPool().query<{ month: string | null }>(
    'SELECT MAX(month) AS month FROM pokemon_usage WHERE format_id = $1',
    [formatId],
  );
  return rows[0]?.month ?? null;
}

/** Linha de usage mais recente de um Pokémon em um formato. */
export async function getUsageRow(formatId: string, name: string): Promise<UsageRow | null> {
  const { rows } = await getPool().query<UsageRow>(
    `SELECT pokemon_name, format_id, month, usage_pct, rank, raw_count, data
       FROM pokemon_usage
      WHERE format_id = $1 AND pokemon_name = $2
      ORDER BY month DESC
      LIMIT 1`,
    [formatId, name],
  );
  return rows[0] ?? null;
}

/** Nomes dos Pokémon mais usados (agregado entre formatos, mês mais recente de cada um). */
export async function getTopUsedNames(limit: number): Promise<string[]> {
  const { rows } = await getPool().query<{ pokemon_name: string }>(
    `SELECT pokemon_name, MIN(rank) AS best_rank
       FROM pokemon_usage u
      WHERE month = (SELECT MAX(month) FROM pokemon_usage x WHERE x.format_id = u.format_id)
      GROUP BY pokemon_name
      ORDER BY best_rank
      LIMIT $1`,
    [limit],
  );
  return rows.map((r) => r.pokemon_name);
}

/**
 * Item mais usado de cada nome em `names`, no mesmo formato/mês — usado para
 * mostrar o item ao lado de teammates/checks (ex.: mega stone de uma forma
 * mega, já que o chaos inteiro do formato traz um `ChaosEntry` com `Items`
 * próprio para cada Pokémon, não só para o Pokémon consultado).
 */
export async function getTopItems(
  formatId: string,
  month: string,
  names: string[],
): Promise<Map<string, string>> {
  if (names.length === 0) return new Map();
  const { rows } = await getPool().query<{ pokemon_name: string; top_item: string | null }>(
    `SELECT pokemon_name, data->'items'->0->>'name' AS top_item
       FROM pokemon_usage
      WHERE format_id = $1 AND month = $2 AND pokemon_name = ANY($3)`,
    [formatId, month, names],
  );
  const map = new Map<string, string>();
  for (const r of rows) {
    if (r.top_item) map.set(r.pokemon_name, r.top_item);
  }
  return map;
}

/**
 * Upsert em lote das entradas de um formato/mês (usado pelo job de usage e
 * pelo fetch-on-miss do competitive).
 */
export async function upsertUsageEntries(
  formatId: string,
  month: string,
  entries: ParsedUsageEntry[],
): Promise<number> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const e of entries) {
      await client.query(
        `INSERT INTO pokemon_usage (pokemon_name, format_id, month, usage_pct, rank, raw_count, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (pokemon_name, format_id, month)
         DO UPDATE SET usage_pct = EXCLUDED.usage_pct, rank = EXCLUDED.rank,
                       raw_count = EXCLUDED.raw_count, data = EXCLUDED.data`,
        [e.name, formatId, month, e.usagePct, e.rank, e.rawCount, JSON.stringify(e)],
      );
    }
    await client.query('COMMIT');
    return entries.length;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
