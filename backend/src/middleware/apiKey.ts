import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

/** Protege rotas admin: exige header `x-api-key` igual a ADMIN_API_KEY. */
export const requireApiKey: RequestHandler = (req, res, next) => {
  const key = req.header('x-api-key');
  if (key !== env.ADMIN_API_KEY) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'x-api-key ausente ou inválida' },
    });
    return;
  }
  next();
};
