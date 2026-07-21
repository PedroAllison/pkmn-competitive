import type { Request, Response } from 'express';
import { z } from 'zod';
import * as pokemonService from '../services/pokemonService.js';

const listQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
  format: z.string().trim().min(1).optional(),
  game: z.enum(['champions']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const competitiveQuerySchema = z.object({
  format: z.string().trim().min(1).default('gen9ou'),
});

const topQuerySchema = z.object({
  format: z.string().trim().min(1).default('gen9ou'),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function listPokemon(req: Request, res: Response): Promise<void> {
  const q = listQuerySchema.parse(req.query);
  const { items, total } = await pokemonService.listPokemon(q);
  res.json({ data: items, meta: { page: q.page, limit: q.limit, total } });
}

export async function getPokemon(req: Request, res: Response): Promise<void> {
  const detail = await pokemonService.getPokemonDetail(req.params.idOrName);
  res.json({ data: detail });
}

export async function getCompetitive(req: Request, res: Response): Promise<void> {
  const { format } = competitiveQuerySchema.parse(req.query);
  const data = await pokemonService.getCompetitiveData(req.params.idOrName, format);
  res.json({ data });
}

export async function getTopUsage(req: Request, res: Response): Promise<void> {
  const { format, limit } = topQuerySchema.parse(req.query);
  const data = await pokemonService.getTopUsage(format, limit);
  res.json({ data });
}
