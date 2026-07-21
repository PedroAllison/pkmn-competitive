import { getPool } from '../config/db.js';
import { logger } from '../config/logger.js';
import { runUsageSync } from '../jobs/syncUsage.js';
import { runPokedexSync } from '../jobs/syncPokedex.js';
import { runTeamsSync } from '../jobs/syncTeams.js';
import { runNewsSync } from '../jobs/syncNews.js';
import type { SyncJobName, SyncStatusEntry } from '../types/contract.js';

/**
 * Orquestrador dos jobs de sync. Cada execução registra início/fim/erro na
 * tabela `sync_log` (consultada por GET /sync/status).
 */

type JobFn = () => Promise<string>;

const JOBS: Record<Exclude<SyncJobName, 'all'>, JobFn> = {
  usage: runUsageSync,
  pokedex: runPokedexSync,
  teams: runTeamsSync,
  news: runNewsSync,
};

/** Ordem do "all": usage primeiro (pokedex depende dos ranks de usage). */
const ALL_ORDER: Exclude<SyncJobName, 'all'>[] = ['usage', 'pokedex', 'teams', 'news'];

async function withSyncLog(job: string, fn: JobFn): Promise<void> {
  const pool = getPool();
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO sync_log (job, status) VALUES ($1, 'running') RETURNING id`,
    [job],
  );
  const logId = rows[0].id;
  try {
    const message = await fn();
    await pool.query(
      `UPDATE sync_log SET status = 'success', message = $2, finished_at = now() WHERE id = $1`,
      [logId, message.slice(0, 2000)],
    );
    logger.info({ job, message }, 'Job de sync concluído');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await pool.query(
      `UPDATE sync_log SET status = 'error', message = $2, finished_at = now() WHERE id = $1`,
      [logId, message.slice(0, 2000)],
    );
    logger.error({ job, err: message }, 'Job de sync falhou');
    throw err;
  }
}

/** Executa um job (ou todos, em ordem) registrando em sync_log. */
export async function runJob(job: SyncJobName): Promise<void> {
  const names = job === 'all' ? ALL_ORDER : [job];
  for (const name of names) {
    try {
      await withSyncLog(name, JOBS[name]);
    } catch {
      // Falha de um job não impede os demais no "all"; já registrado no sync_log.
    }
  }
}

/** Dispara um job de forma assíncrona (fire-and-forget) — usado por POST /sync/run. */
export function startJob(job: SyncJobName): void {
  void runJob(job).catch((err) => {
    logger.error({ job, err: (err as Error).message }, 'Execução assíncrona de sync falhou');
  });
}

/** Última execução de cada job (para GET /sync/status). */
export async function getStatus(): Promise<SyncStatusEntry[]> {
  const { rows } = await getPool().query<{
    job: string;
    status: 'running' | 'success' | 'error';
    message: string | null;
    started_at: Date;
  }>(
    `SELECT DISTINCT ON (job) job, status, message, started_at
       FROM sync_log
      ORDER BY job, started_at DESC`,
  );
  return rows.map((r) => ({
    job: r.job,
    lastRunISO: r.started_at.toISOString(),
    status: r.status,
    message: r.message,
  }));
}
