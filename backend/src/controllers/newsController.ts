import type { Request, Response } from 'express';
import { z } from 'zod';
import * as newsService from '../services/newsService.js';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listNews(req: Request, res: Response): Promise<void> {
  const { limit } = querySchema.parse(req.query);
  const items = await newsService.listNews(limit);
  res.json({ data: items });
}
