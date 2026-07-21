# PokéCompanion — Web

Frontend web (React + Vite + TypeScript) do PokéCompanion. Consome a API REST
do backend (`../backend`) — contrato completo em `../docs/API_CONTRACT.md`.

## Rodando localmente

Pré-requisitos: Node.js 18+.

```bash
cd web
npm install
cp .env.example .env   # ajuste VITE_API_BASE_URL se necessário
npm run dev
```

Acesse `http://localhost:5173`. A página inicial (`/`) é o **Diagnóstico do
sistema** — roda um teste contra cada endpoint principal da API
(`/health`, `/formats`, `/pokemon`, `/usage/top`, `/teams`, `/news`) e mostra
status, latência e um preview da resposta. Use-a para confirmar que o backend
(com Postgres e Redis) está no ar antes de navegar pelas demais páginas.

Para rodar o backend, veja `../backend/README.md` (resumo: `docker-compose up
-d` na pasta `backend/` sobe Postgres+Redis, depois `npm install && npm run
migrate && npm run seed && npm run dev`).

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite, porta 5173) |
| `npm run build` | Type-check + build de produção em `dist/` |
| `npm run preview` | Serve o build de produção localmente |
| `npm run typecheck` | Apenas type-check, sem build |
| `npm run lint` | ESLint |

## Estrutura

```
web/
├── src/
│   ├── main.tsx            # bootstrap (React + BrowserRouter)
│   ├── App.tsx              # casca + rotas
│   ├── api/                 # cliente HTTP tipado + tipos do contrato
│   ├── components/          # NavBar, StatusBadge, UnderConstruction...
│   ├── hooks/                # useTheme (claro/escuro, MD3)
│   ├── pages/                # uma página por rota
│   └── styles/theme.css      # tokens MD3, tema claro/escuro
├── index.html
└── vite.config.ts
```

## Status das páginas

- **Diagnóstico do sistema** (`/`) — completo, valida a API ponta a ponta.
- **Pokédex, Times, Team Builder, Ferramentas** — placeholders; ver
  `docs/ARCHITECTURE.md` para o roadmap.
