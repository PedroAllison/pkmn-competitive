import type { Request, Response } from 'express';
import * as formatService from '../services/formatService.js';

export async function listFormats(_req: Request, res: Response): Promise<void> {
  const formats = await formatService.listFormats();
  res.json({ data: formats });
}
