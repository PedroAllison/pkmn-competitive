import { sleep } from '../utils/async.js';
import { logger } from '../config/logger.js';

/** Erro de fetch com status HTTP preservado (para diferenciar 404 de 5xx). */
export class FetchError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    message?: string,
  ) {
    super(message ?? `HTTP ${status} em ${url}`);
    this.name = 'FetchError';
  }
}

export interface FetchOptions {
  retries?: number;
  backoffMs?: number;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

const DEFAULTS: Required<Omit<FetchOptions, 'headers'>> = {
  retries: 3,
  backoffMs: 500,
  timeoutMs: 30_000,
};

/**
 * `fetch` nativo com retry + backoff exponencial. Erros 4xx não são
 * re-tentados (falha determinística); 5xx e erros de rede sim.
 */
export async function fetchWithRetry(url: string, opts: FetchOptions = {}): Promise<Response> {
  const { retries, backoffMs, timeoutMs } = { ...DEFAULTS, ...opts };
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': 'PokeCompanion/1.0 (backend sync)', ...opts.headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500) {
        throw new FetchError(res.status, url);
      }
      lastErr = new FetchError(res.status, url);
    } catch (err) {
      if (err instanceof FetchError && err.status < 500) throw err;
      lastErr = err;
    }
    if (attempt < retries) {
      const wait = backoffMs * 2 ** attempt;
      logger.debug({ url, attempt, wait }, 'retry de fetch');
      await sleep(wait);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`Falha ao buscar ${url}`);
}

/** fetch JSON tipado com retry. */
export async function fetchJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const res = await fetchWithRetry(url, opts);
  return (await res.json()) as T;
}

/** fetch texto (HTML de listagens etc.) com retry. */
export async function fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
  const res = await fetchWithRetry(url, opts);
  return res.text();
}
