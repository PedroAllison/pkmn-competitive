# PokéCompanion — Arquitetura

> **Nota:** o projeto era originalmente planejado como app mobile (Flutter).
> Foi reformulado para **site (SPA web)** — a pasta `app/` foi removida. O
> backend não mudou (é agnóstico de frontend).

## Monorepo

```
Pkmn Competitive/
├── docs/                  # Contrato de API e arquitetura
├── backend/               # Node.js + Express + TypeScript + PostgreSQL + Redis
└── web/                   # React + Vite + TypeScript (SPA)
```

## Backend (`backend/`)

```
backend/
├── src/
│   ├── index.ts           # bootstrap
│   ├── app.ts             # express app (rotas, middlewares)
│   ├── config/            # env, pool pg, cliente redis
│   ├── middleware/        # cache redis, erros, api-key, rate limit
│   ├── routes/            # definição de rotas REST (v1)
│   ├── controllers/       # request → service → response
│   ├── services/          # regra de negócio + acesso a dados
│   ├── datasources/       # clients: pokeapi, showdown, smogon stats
│   ├── jobs/              # sync diário (node-cron)
│   ├── db/
│   │   ├── migrations/    # SQL numerado (node-pg-migrate style, SQL puro)
│   │   └── seeds/         # times campeões, notícias, formatos
│   └── utils/
└── test/                  # vitest
```

Camadas: `routes → controllers → services → (db | datasources | redis)`. Datasources nunca são chamados por controllers diretamente.

## Web (`web/`)

SPA React (Vite + TypeScript, sem framework meta como Next.js por ora).

```
web/
├── index.html
├── vite.config.ts
└── src/
    ├── main.tsx            # bootstrap (React + BrowserRouter)
    ├── App.tsx              # casca do site + rotas (react-router-dom)
    ├── vite-env.d.ts
    ├── api/
    │   ├── types.ts          # tipos espelhando docs/API_CONTRACT.md
    │   └── client.ts         # fetch tipado, base URL configurável em runtime
    ├── components/           # NavBar, StatusBadge, UnderConstruction...
    ├── hooks/                # useTheme (claro/escuro MD3)
    ├── pages/                # uma página por rota
    └── styles/theme.css      # tokens MD3 (cor, elevação, raio), tema claro/escuro
```

### Convenções
- Sem Redux/estado global pesado por ora: cada página busca seus próprios
  dados via `src/api/client.ts` (hooks locais com `useState`/`useEffect`).
  Se a complexidade crescer (Team Builder, cache client-side), reavaliar
  TanStack Query.
- Roteamento: `react-router-dom`, rotas simples (`/pokemon`, `/teams`,
  `/builder`, `/tools`). Sem SSR.
- Tema: tokens CSS (`--md-*`) em `styles/theme.css`, alternância via atributo
  `data-theme` no `<html>`, persistida em `localStorage`.
- A URL base da API é lida de `VITE_API_BASE_URL` (build) mas pode ser
  sobrescrita em runtime pela tela de diagnóstico (persistida em
  `localStorage`) — útil para apontar o site para um backend em outro host
  sem rebuildar.

### Estado do roadmap do site
- **Diagnóstico do sistema** (`/`) — implementado. Testa `/health`,
  `/formats`, `/pokemon`, `/usage/top`, `/teams`, `/news` ponta a ponta.
- **Pokédex, Times, Team Builder, Ferramentas** — placeholders, a
  implementar nas próximas sessões (mesmo escopo funcional descrito no
  prompt original do projeto, agora como páginas web em vez de telas
  mobile).
- Favoritos/histórico (antes via Hive no app) ainda não têm equivalente
  web — quando entrarem, provavelmente via `localStorage` no browser
  (sem necessidade de conta/login no MVP).
