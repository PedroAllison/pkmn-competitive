import type { Request, Response } from 'express';
import { z } from 'zod';
import * as syncService from '../services/syncService.js';

const runQuerySchema = z.object({
  job: z.enum(['usage', 'pokedex', 'teams', 'news', 'all']).default('all'),
});

/** POST /sync/run — dispara o job de forma assíncrona e responde imediatamente. */
export async function runSync(req: Request, res: Response): Promise<void> {
  const { job } = runQuerySchema.parse(req.query);
  syncService.startJob(job);
  res.status(202).json({ data: { started: true, job } });
}

/** GET /sync/status — última execução de cada job. */
export async function getSyncStatus(_req: Request, res: Response): Promise<void> {
  const status = await syncService.getStatus();
  res.json({ data: status });
}
