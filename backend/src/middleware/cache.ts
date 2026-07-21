import type { RequestHandler, Response } from 'express';
import { getCache } from '../config/redis.js';

/**
 * Cache de respostas GET por URL (Redis), com header `X-Cache: HIT|MISS`.
 * TTLs do contrato: pokémon 24h · competitive/usage 12h · teams/news 1h.
 * Sem Redis disponível, tudo é MISS e o request segue normalmente.
 */

const HOUR = 3600;

/** Resolve o TTL (segundos) pelo path da rota. */
export function ttlForPath(path: string): number {
  if (path.includes('/competitive') || path.includes('/usage')) return 12 * HOUR;
  if (path.includes('/pokemon')) return 24 * HOUR;
  if (path.includes('/teams') || path.includes('/news')) return 1 * HOUR;
  if (path.includes('/formats')) return 24 * HOUR;
  return 5 * 60;
}

export function cacheMiddleware(): RequestHandler {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }
    const cache = getCache();
    const key = `pc:v1:${req.originalUrl}`;

    const hit = await cache.get(key);
    if (hit !== null) {
      res.setHeader('X-Cache', 'HIT');
      res.type('application/json').send(hit);
      return;
    }

    res.setHeader('X-Cache', 'MISS');
    const ttl = ttlForPath(req.originalUrl);
    const originalJson = res.json.bind(res);
    res.json = ((body: unknown): Response => {
      if (res.statusCode === 200) {
        void cache.set(key, JSON.stringify(body), ttl);
      }
      return originalJson(body);
    }) as Response['json'];

    next();
  };
}
