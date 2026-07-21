import type { Request, Response } from 'express';
import { z } from 'zod';
import * as teamService from '../services/teamService.js';

const listQuerySchema = z.object({
  format: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listTeams(req: Request, res: Response): Promise<void> {
  const q = listQuerySchema.parse(req.query);
  const { items, total } = await teamService.listTeams(q);
  res.json({ data: items, meta: { page: q.page, limit: q.limit, total } });
}

export async function getTeam(req: Request, res: Response): Promise<void> {
  const team = await teamService.getTeam(req.params.id);
  res.json({ data: team });
}
