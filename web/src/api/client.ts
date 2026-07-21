import type { ApiEnvelope, ApiErrorEnvelope } from './types';

const STORAGE_KEY = 'pokecompanion:apiBaseUrl';
const DEFAULT_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000/api/v1';

/** Lê a base URL configurada (localStorage > env > default). */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored;
    }
  }
  return DEFAULT_BASE_URL;
}

/** Persiste uma nova base URL (usado pela tela de validação). */
export function setApiBaseUrl(url: string): void {
  window.localStorage.setItem(STORAGE_KEY, url);
}

/** Erro tipado lançado pelo cliente HTTP em respostas não-2xx ou de rede. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
    readonly code: string | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: ApiEnvelope<T>['meta'];
  /** `HIT` quando a resposta veio do cache Redis do backend, `MISS` caso contrário. */
  cache: 'HIT' | 'MISS' | null;
  /** Latência da chamada, em milissegundos. */
  durationMs: number;
}

/**
 * Executa um GET contra a API e retorna o envelope já desembrulhado.
 *
 * Lança [ApiError] tanto para erros HTTP (envelope `{ error }`) quanto para
 * falhas de rede/timeout — a tela de validação usa isso para reportar cada
 * checagem individualmente.
 */
export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<ApiResult<T>> {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const url = new URL(`${base}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const started = performance.now();
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
  } catch (cause) {
    throw new ApiError(
      cause instanceof Error
        ? `Falha de rede: ${cause.message}`
        : 'Falha de rede desconhecida',
      null,
      'NETWORK_ERROR',
    );
  }
  const durationMs = Math.round(performance.now() - started);
  const cache = response.headers.get('X-Cache') as 'HIT' | 'MISS' | null;

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errBody = body as ApiErrorEnvelope | null;
    throw new ApiError(
      errBody?.error?.message ?? `HTTP ${response.status}`,
      response.status,
      errBody?.error?.code ?? null,
    );
  }

  const envelope = body as ApiEnvelope<T>;
  return { data: envelope.data, meta: envelope.meta, cache, durationMs };
}
