import { getPool } from '../config/db.js';
import { getCache } from '../config/redis.js';

export interface Health {
  status: 'ok';
  db: boolean;
  redis: boolean;
}

/** Health check: app está de pé; flags indicam a disponibilidade de PG/Redis. */
export async function getHealth(): Promise<Health> {
  let db = false;
  try {
    await getPool().query('SELECT 1');
    db = true;
  } catch {
    db = false;
  }
  const redis = await getCache().ping();
  return { status: 'ok', db, redis };
}
