import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';
import { logger } from '../config/logger.js';

/** Envelopa handlers async para propagar rejeições ao error handler (Express 4). */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/** 404 para rotas desconhecidas, no envelope de erro do contrato. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Rota ${req.method} ${req.path} não encontrada` },
  });
}

/** Error handler central: converte qualquer erro no envelope `{ error: { code, message } }`. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const message = err.issues
      .map((i) => `${i.path.join('.') || 'query'}: ${i.message}`)
      .join('; ');
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message } });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  const message = err instanceof Error ? err.message : 'Erro interno';
  logger.error({ err: message }, 'Erro não tratado');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } });
}
