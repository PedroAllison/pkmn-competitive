import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, closePool } from '../config/db.js';

/**
 * Runner de migrations: aplica os arquivos .sql de src/db/migrations em ordem
 * numérica, cada um em transação própria, registrando em `schema_migrations`.
 * Uso: `npm run migrate`.
 */
const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

async function migrate(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const { rowCount } = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [
      file,
    ]);
    if ((rowCount ?? 0) > 0) {
      console.log(`= ${file} (já aplicada)`);
      continue;
    }

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✓ ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`✗ ${file} falhou:`, (err as Error).message);
      throw err;
    } finally {
      client.release();
    }
  }
  console.log('Migrations concluídas.');
}

migrate()
  .then(() => closePool())
  .catch(async (err) => {
    console.error(err);
    await closePool();
    process.exit(1);
  });
