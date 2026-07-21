import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Abstração de cache. O app DEVE subir mesmo sem Redis: sem `REDIS_URL` (ou
 * com o servidor fora do ar) todas as operações viram no-op silencioso e um
 * warning é logado uma única vez.
 */
export interface CacheClient {
  readonly enabled: boolean;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  ping(): Promise<boolean>;
  quit(): Promise<void>;
}

class NoopCache implements CacheClient {
  readonly enabled = false;
  async get(): Promise<string | null> {
    return null;
  }
  async set(): Promise<void> {
    /* no-op */
  }
  async ping(): Promise<boolean> {
    return false;
  }
  async quit(): Promise<void> {
    /* no-op */
  }
}

class RedisCache implements CacheClient {
  readonly enabled = true;
  private healthy = false;
  private readonly client: Redis;

  constructor(url: string) {
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 2_000, 30_000),
    });
    this.client.on('error', (err: Error) => {
      if (this.healthy) {
        logger.warn({ err: err.message }, 'Redis indisponível — cache degradado para no-op');
      }
      this.healthy = false;
    });
    this.client.on('ready', () => {
      this.healthy = true;
      logger.info('Redis conectado — cache habilitado');
    });
    this.client.connect().catch((err: Error) => {
      logger.warn({ err: err.message }, 'Falha ao conectar no Redis — cache em no-op até reconectar');
    });
  }

  async get(key: string): Promise<string | null> {
    if (!this.healthy) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (!this.healthy) return;
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch {
      /* cache é best-effort */
    }
  }

  async ping(): Promise<boolean> {
    if (!this.healthy) return false;
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}

let cache: CacheClient | null = null;

/** Retorna o cliente de cache (singleton). */
export function getCache(): CacheClient {
  if (!cache) {
    if (env.REDIS_URL) {
      cache = new RedisCache(env.REDIS_URL);
    } else {
      logger.warn('REDIS_URL não definido — cache desabilitado (no-op)');
      cache = new NoopCache();
    }
  }
  return cache;
}
