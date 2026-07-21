import type { Request, Response } from 'express';
import * as healthService from '../services/healthService.js';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const health = await healthService.getHealth();
  res.json({ data: health });
}
