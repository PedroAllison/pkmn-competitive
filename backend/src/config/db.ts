import pg from 'pg';
import { env } from './env.js';

let pool: pg.Pool | null = null;

/**
 * Pool do PostgreSQL, criado de forma lazy (nenhuma conexão é aberta até a
 * primeira query — importante para testes sem banco).
 */
export function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

/** Encerra o pool (shutdown gracioso). */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
