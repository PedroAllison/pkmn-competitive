# Lab Pokémon

Site de referência para o competitivo de **Pokémon Champions**: Pokédex filtrável por formato/regulation, times de exemplo prontos para importar no Pokémon Showdown, e um Team Builder básico com análise de cobertura de tipos.

Monorepo:

```
backend/   API REST (Node.js + Express + TypeScript + PostgreSQL + Redis)
web/       SPA (React + Vite + TypeScript)
docs/      Arquitetura e contrato da API
```

## Rodando localmente

Pré-requisitos: Node.js 22+, PostgreSQL e Redis rodando localmente (ou dentro do WSL2, se estiver no Windows — o backend espera `localhost:5432`/`localhost:6379`, ver `backend/.env.example`).

**Primeira vez** (instala tudo e prepara o banco):

```bash
npm install            # dependências da raiz (concurrently)
npm run setup           # instala backend/ e web/, aplica migrations e popula o banco
```

**No dia a dia**, um único comando na raiz sobe backend + frontend juntos (e, no Windows, liga o WSL automaticamente antes):

```bash
npm run dev
```

- API em `http://localhost:3000/api/v1`
- Site em `http://localhost:5173`

O terminal mostra os logs dos dois com prefixo `[backend]`/`[web]`. Para rodar cada lado separado (ex.: debugar só o backend), use `npm run dev --prefix backend` ou `npm run dev --prefix web`.

Mais detalhes de cada parte em `backend/README.md` e `web/README.md`. O contrato completo da API está em `docs/API_CONTRACT.md`.

## Escopo

O produto cobre **apenas Pokémon Champions** — o software oficial de VGC para o Pokémon World Championships a partir de 2026. Champions tem roster próprio (limitado, ~208 espécies + Megas na regulation atual), sem Terastalização/Dynamax/Z-Moves, e catálogo de itens diferente de Scarlet/Violet. Ver `docs/ARCHITECTURE.md` para detalhes.
