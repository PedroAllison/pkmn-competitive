# PokéCompanion — Backend

API REST do PokéCompanion (Pokémon competitivo): Pokédex, usage stats do Smogon, times e notícias. Implementa o contrato de `../docs/API_CONTRACT.md` (envelope `{ data, meta }`, erros `{ error: { code, message } }`, cache com `X-Cache: HIT|MISS`).

**Stack:** Node.js 22 · TypeScript (ESM) · Express 4 · PostgreSQL (pg) · Redis (ioredis) · node-cron · zod · pino · vitest.

## Setup

```bash
cd backend
cp .env.example .env          # ajuste se necessário
docker compose up -d          # sobe Postgres 16 + Redis 7 prontos
npm install
npm run migrate               # aplica src/db/migrations/*.sql (tabela schema_migrations)
npm run seed                  # formatos canônicos, ~10 times, ~8 notícias
npm run dev                   # tsx watch — http://localhost:3000/api/v1
```

> **Redis é opcional**: sem `REDIS_URL` (ou com o Redis fora do ar) o app sobe normalmente e o cache vira no-op com warning — toda resposta sai `X-Cache: MISS`.

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | dev server com reload (tsx watch) |
| `npm run build` | compila TypeScript para `dist/` |
| `npm start` | roda o build (`node dist/index.js`) |
| `npm run migrate` | runner de migrations SQL puras (numeradas, transacionais) |
| `npm run seed` | seed idempotente (formats/teams/news) |
| `npm test` | vitest (não requer PG/Redis — rotas usam mocks) |
| `npm run lint` | eslint (flat config + typescript-eslint) |

## Endpoints (v1)

Base: `http://localhost:3000/api/v1` — detalhes/shapes em `../docs/API_CONTRACT.md`.

- `GET /health` · `GET /formats`
- `GET /pokemon?search=&type=&format=&page=&limit=` · `GET /pokemon/:idOrName` · `GET /pokemon/:idOrName/competitive?format=` · `GET /usage/top?format=&limit=`
- `GET /teams?format=&page=&limit=` · `GET /teams/:id` (inclui `showdownPaste`, `strategy`, `leadGuide`)
- `GET /news?limit=`
- Admin (header `x-api-key: $ADMIN_API_KEY`): `POST /sync/run?job=usage|pokedex|teams|news|all` · `GET /sync/status`

### Estratégia de dados

- **db-first, fetch-on-miss**: se um Pokémon não está no banco, é buscado na PokéAPI, persistido e respondido na hora. O mesmo vale para dados competitivos (baixa o chaos do Smogon do formato inteiro sob demanda).
- `difficulty` (easy/medium/hard) é heurística determinística: nº de spreads viáveis (≥5%), papéis mistos, dependência de itens Choice e de setup (`src/services/difficulty.ts`).
- `strategyText` é gerado por template pt-BR a partir dos usage stats — determinístico, sem IA externa (`src/services/strategyText.ts`).

### Cache (Redis)

GETs cacheados por URL (`pc:v1:<originalUrl>`), TTLs do contrato: pokémon **24h**, competitive/usage **12h**, teams/news **1h**, formats 24h. Header `X-Cache: HIT|MISS`.

## Jobs de sincronização

Agendados diariamente às **05:00 UTC** (node-cron) na ordem `usage → pokedex → teams → news`; cada execução registra em `sync_log`. Disparo manual: `POST /sync/run?job=...`.

| Job | O que faz |
|---|---|
| `usage` | Resolve o mês mais recente do Smogon (tenta o mês atual e regride até achar), baixa `chaos/<format>-<baseline>.json` de cada formato e normaliza (spreads `Nature/HP/Atk/Def/SpA/SpD/Spe`, % de moves/items/tera/teammates, checks & counters com score `p − 4d`). Mapeamento de formato: `gen9ou` → `gen9ou`; `gen9vgc2026`/`gen9battlestadiumsingles` → resolvidos pela listagem do diretório (sufixos de regulation, ex.: `gen9vgc2026regj`), preferindo variantes sem `bo3` e o baseline `SMOGON_BASELINE` (fallback 1825/1695/1630/1500/0). Ver `src/datasources/smogonStats.ts`. |
| `pokedex` | Ficha completa (PokéAPI + evolução + learnset gen9 enriquecido com `moves.json` do Showdown) dos ~300 Pokémon mais usados; o resto entra sob demanda. |
| `teams` | Roda os `TeamProvider`s registrados (`src/jobs/providers/`). Hoje: provider de seed + stub documentado do Pikalytics. |
| `news` | Roda os `NewsProvider`s. Hoje: seed + stubs documentados de Victory Road e LabMaus (sem API pública — estrutura de scraper plugável pronta). |

Para plugar um scraper novo: implemente `NewsProvider`/`TeamProvider` (`src/jobs/providers/types.ts`) e registre em `src/jobs/providers/index.ts`.

## Estrutura

```
src/
├── index.ts / app.ts      # bootstrap / express app
├── config/                # env (zod), pool pg, redis (no-op fallback), logger
├── middleware/            # cache, erros, api-key, rate limit, logging
├── routes/ → controllers/ → services/ → (db | datasources | redis)
├── datasources/           # pokeapi, showdown, smogonStats (+ parser chaos puro)
├── jobs/                  # scheduler 05:00 UTC + sync jobs + providers plugáveis
├── db/migrations/ (SQL numerado) · db/seeds/ · migrate.ts · seed.ts
└── utils/
test/                      # vitest: parser chaos, difficulty, strategyText, rotas (supertest + mocks)
```

## Notas

- O parser chaos divide o combinado KO+switch igualmente entre `koPct`/`switchPct` (o formato chaos do Smogon não separa os dois — só o `.txt` de moveset separa).
- Rate limit é em memória (por IP, 120 req/min) — trocar por Redis se houver múltiplas réplicas.
- Erros de formato: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `UNAUTHORIZED` (401), `RATE_LIMITED` (429), `UPSTREAM_ERROR` (502), `INTERNAL_ERROR` (500).
