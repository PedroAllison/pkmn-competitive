import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

/**
 * Rate limit simples em memória por IP (janela fixa). Suficiente para uma
 * instância; para múltiplas réplicas, trocar por implementação em Redis.
 * Desabilitado em NODE_ENV=test.
 */
export function rateLimit({ windowMs = 60_000, max = 120 } = {}): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Limpeza periódica para não crescer indefinidamente.
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, h] of hits) {
      if (h.resetAt <= now) hits.delete(ip);
    }
  }, windowMs);
  timer.unref();

  return (req, res, next) => {
    if (env.NODE_ENV === 'test') {
      next();
      return;
    }
    const ip = req.ip ?? 'unknown';
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || entry.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Muitas requisições — tente novamente em breve' },
      });
      return;
    }
    next();
  };
}
