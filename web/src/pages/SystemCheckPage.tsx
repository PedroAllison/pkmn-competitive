import { useCallback, useMemo, useState } from 'react';
import { apiGet, ApiError, getApiBaseUrl, setApiBaseUrl } from '../api/client';
import type {
  Format,
  Health,
  NewsItem,
  PokemonSummary,
  TeamSummary,
} from '../api/types';
import { StatusBadge, type CheckStatus } from '../components/StatusBadge';

interface CheckResult {
  status: CheckStatus;
  durationMs?: number;
  cache?: 'HIT' | 'MISS' | null;
  errorMessage?: string;
  preview?: string;
}

interface CheckDefinition {
  id: string;
  label: string;
  description: string;
  method: string;
  path: string;
  run: () => Promise<{ preview: string; durationMs: number; cache: 'HIT' | 'MISS' | null }>;
}

/**
 * Resume um valor qualquer para uma linha curta de preview, sem travar a UI
 * com JSONs grandes (ex.: learnsets ou usage stats completos).
 */
function summarize(value: unknown): string {
  if (Array.isArray(value)) {
    return `${value.length} item(ns)` + (value.length ? ` — primeiro: ${summarizeItem(value[0])}` : '');
  }
  return summarizeItem(value);
}

function summarizeItem(value: unknown): string {
  const json = JSON.stringify(value);
  if (!json) {
    return 'null';
  }
  return json.length > 160 ? `${json.slice(0, 160)}…` : json;
}

/**
 * Tela de diagnóstico end-to-end: chama cada endpoint principal da API e
 * reporta status, latência e um preview da resposta. Serve para validar que
 * frontend, backend, Postgres e Redis estão funcionando juntos antes de
 * usar as demais páginas do site.
 */
export function SystemCheckPage() {
  const [baseUrl, setBaseUrl] = useState(getApiBaseUrl());
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [runningAll, setRunningAll] = useState(false);

  const checks: CheckDefinition[] = useMemo(
    () => [
      {
        id: 'health',
        label: 'Health check',
        description: 'GET /health — confirma que a API está de pé e se Postgres/Redis estão acessíveis.',
        method: 'GET',
        path: '/health',
        run: async () => {
          const res = await apiGet<Health>('/health');
          return {
            preview: `status=${res.data.status} db=${res.data.db} redis=${res.data.redis}`,
            durationMs: res.durationMs,
            cache: res.cache,
          };
        },
      },
      {
        id: 'formats',
        label: 'Formatos',
        description: 'GET /formats — lista os formatos competitivos suportados (OU, UU, VGC...).',
        method: 'GET',
        path: '/formats',
        run: async () => {
          const res = await apiGet<Format[]>('/formats');
          return { preview: summarize(res.data), durationMs: res.durationMs, cache: res.cache };
        },
      },
      {
        id: 'pokemon-search',
        label: 'Busca de Pokémon',
        description: 'GET /pokemon?limit=5 — lista paginada da Pokédex.',
        method: 'GET',
        path: '/pokemon?limit=5',
        run: async () => {
          const res = await apiGet<PokemonSummary[]>('/pokemon', { limit: 5 });
          return { preview: summarize(res.data), durationMs: res.durationMs, cache: res.cache };
        },
      },
      {
        id: 'usage-top',
        label: 'Metagame (usage top)',
        description: 'GET /usage/top?format=gen9ou&limit=5 — mais usados em OU no mês corrente.',
        method: 'GET',
        path: '/usage/top?format=gen9ou&limit=5',
        run: async () => {
          const res = await apiGet<PokemonSummary[]>('/usage/top', {
            format: 'gen9ou',
            limit: 5,
          });
          return { preview: summarize(res.data), durationMs: res.durationMs, cache: res.cache };
        },
      },
      {
        id: 'teams',
        label: 'Times',
        description: 'GET /teams?limit=5 — times campeões/importáveis para o Showdown.',
        method: 'GET',
        path: '/teams?limit=5',
        run: async () => {
          const res = await apiGet<TeamSummary[]>('/teams', { limit: 5 });
          return { preview: summarize(res.data), durationMs: res.durationMs, cache: res.cache };
        },
      },
      {
        id: 'news',
        label: 'Notícias',
        description: 'GET /news?limit=5 — últimas notícias do competitivo.',
        method: 'GET',
        path: '/news?limit=5',
        run: async () => {
          const res = await apiGet<NewsItem[]>('/news', { limit: 5 });
          return { preview: summarize(res.data), durationMs: res.durationMs, cache: res.cache };
        },
      },
    ],
    [],
  );

  const runCheck = useCallback(async (check: CheckDefinition) => {
    setResults((prev) => ({ ...prev, [check.id]: { status: 'loading' } }));
    try {
      const { preview, durationMs, cache } = await check.run();
      setResults((prev) => ({
        ...prev,
        [check.id]: { status: 'ok', durationMs, cache, preview },
      }));
    } catch (cause) {
      const message =
        cause instanceof ApiError
          ? `${cause.status ?? '—'} ${cause.code ?? ''} — ${cause.message}`
          : cause instanceof Error
            ? cause.message
            : 'Erro desconhecido';
      setResults((prev) => ({
        ...prev,
        [check.id]: { status: 'error', errorMessage: message },
      }));
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunningAll(true);
    for (const check of checks) {
      // eslint-disable-next-line no-await-in-loop -- sequencial de propósito, para não sobrecarregar o backend local.
      await runCheck(check);
    }
    setRunningAll(false);
  }, [checks, runCheck]);

  const handleSaveBaseUrl = useCallback(() => {
    setApiBaseUrl(baseUrl.trim());
    setResults({});
  }, [baseUrl]);

  const summaryCounts = useMemo(() => {
    const values = Object.values(results);
    return {
      ok: values.filter((r) => r.status === 'ok').length,
      error: values.filter((r) => r.status === 'error').length,
      total: checks.length,
    };
  }, [results, checks.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section>
        <h1 style={{ marginBottom: 4 }}>Diagnóstico do sistema</h1>
        <p style={{ color: 'var(--md-on-surface-variant)', maxWidth: 640 }}>
          Valida a comunicação entre este site e a API do backend (que por sua vez fala com
          PostgreSQL, Redis e as fontes de dados externas). Rode o backend localmente
          (<code>docker-compose up -d</code> + <code>npm run dev</code> na pasta <code>backend/</code>)
          e clique em &quot;Rodar todos os testes&quot;.
        </p>
      </section>

      <section className="md-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 260 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
            URL base da API
          </span>
          <input
            className="md-input"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:3000/api/v1"
          />
        </label>
        <button type="button" className="md-button secondary" onClick={handleSaveBaseUrl}>
          Salvar URL
        </button>
        <button type="button" className="md-button" onClick={runAll} disabled={runningAll}>
          {runningAll ? 'Rodando…' : 'Rodar todos os testes'}
        </button>
      </section>

      {Object.keys(results).length > 0 && (
        <section
          className="md-card"
          style={{ display: 'flex', gap: 16, alignItems: 'center' }}
        >
          <strong>Resumo:</strong>
          <span className="badge ok">{summaryCounts.ok} OK</span>
          <span className="badge error">{summaryCounts.error} falhou</span>
          <span className="badge pending">
            {summaryCounts.total - summaryCounts.ok - summaryCounts.error} pendente(s)
          </span>
        </section>
      )}

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {checks.map((check) => {
          const result = results[check.id];
          return (
            <article key={check.id} className="md-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{check.label}</h3>
                  <code style={{ fontSize: '0.75rem', color: 'var(--md-on-surface-variant)' }}>
                    {check.method} {check.path}
                  </code>
                </div>
                <StatusBadge status={result?.status ?? 'idle'} />
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--md-on-surface-variant)' }}>
                {check.description}
              </p>
              {result?.status === 'ok' && (
                <div style={{ fontSize: '0.8rem' }}>
                  <div>
                    ⏱ {result.durationMs}ms
                    {result.cache && (
                      <>
                        {' · '}
                        cache: <strong>{result.cache}</strong>
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontFamily: 'monospace',
                      background: 'var(--md-surface)',
                      padding: 8,
                      borderRadius: 8,
                      wordBreak: 'break-all',
                    }}
                  >
                    {result.preview}
                  </div>
                </div>
              )}
              {result?.status === 'error' && (
                <div style={{ fontSize: '0.8rem', color: 'var(--md-error)' }}>
                  {result.errorMessage}
                </div>
              )}
              <button
                type="button"
                className="md-button secondary"
                onClick={() => runCheck(check)}
                disabled={result?.status === 'loading'}
                style={{ alignSelf: 'flex-start' }}
              >
                {result ? 'Rodar novamente' : 'Rodar teste'}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
