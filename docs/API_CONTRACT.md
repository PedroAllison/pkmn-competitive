# PokéCompanion — API Contract (v1)

Base URL: `http://localhost:3000/api/v1`
All responses: JSON, envelope `{ "data": ..., "meta": { ... } }`. Errors: `{ "error": { "code": string, "message": string } }` with proper HTTP status.

## Formats

**Escopo do produto: apenas Pokémon Champions.** Confirmado em
`champions.pokemon.com/en-us/gameplay/` — a partir de 2026 o Champions é o
software oficial de VGC (doubles) para o Pokémon World Championships e
Championship Series, com dois formatos de batalha (Single/Double) em três
modos (Ranked/Casual/Private) e regulations que mudam a cada poucas
temporadas. Scarlet/Violet (tiers antigos do Smogon) e Legends Z-A (mecânica
de batalha em tempo real, sem ranked ainda) foram removidos do catálogo.

IDs são o **prefixo exato** do arquivo chaos correspondente do Smogon
(`smogon.com/stats/<month>/chaos/<id>-<baseline>.json`) — confirmado
diretamente contra a listagem do diretório, não chutado. Os antigos ids
genéricos `gen9vgc2026`/`gen9battlestadiumsingles` foram **descontinuados**
pelo próprio Smogon assim que o Champions assumiu o ranked oficial; os
arquivos atuais já vêm nomeados por regulation:

| id | label |
|----|-------|
| `gen9championsvgc2026regmb` | VGC 2026 (Reg. M-B) — regulation atual |
| `gen9championsvgc2026regma` | VGC 2026 (Reg. M-A) |
| `gen9championsvgc2026regmbbo3` | VGC 2026 Bo3 (Reg. M-B) |
| `gen9championsvgc2026regmabo3` | VGC 2026 Bo3 (Reg. M-A) |
| `gen9championsbssregmb` | Battle Stadium Singles (Reg. M-B) |
| `gen9championsbssregma` | Battle Stadium Singles (Reg. M-A) |
| `gen9championsou` | Champions OU |
| `gen9champions4v4doublesuu` | 4v4 Doubles UU |

Todo `Format` tem um campo `game` (`CompetitiveGame = 'champions'`) — hoje é
sempre `champions`, mantido no contrato só para deixar explícito e para o
caso do produto voltar a cobrir outros jogos no futuro.

## Endpoints

### Health
- `GET /health` → `{ data: { status: "ok", db: bool, redis: bool } }`

### Formats
- `GET /formats` → `{ data: Format[] }`
  - `Format = { id, label, gameType: "singles"|"doubles", generation: 9, game: "champions" }`

### Pokémon
- `GET /pokemon?search=&type=&format=&game=&page=1&limit=20`
  → `{ data: PokemonSummary[], meta: { page, limit, total } }`
  - `PokemonSummary = { id, name, displayName, dexNumber, types: string[], spriteUrl, artworkUrl, baseStats: { hp, atk, def, spa, spd, spe }, usagePct: number|null, usageRank: number|null }`
  - **Sempre retorna só Pokémon com dados de uso reais** (nunca a Pokédex completa misturada com espécies fora do formato/jogo):
    - `format` informado: usage do formato exato, ordenado por rank.
    - sem `format` mas com `game` (`champions`): agrega o melhor rank entre todos os formatos do Champions.
    - nem `format` nem `game`: lista a Pokédex completa (uso interno/debug).
- `GET /pokemon/:idOrName`
  → `{ data: PokemonDetail }`
  - `PokemonDetail = PokemonSummary + { height, weight, abilities: [{ name, isHidden, description }], evolutions: [{ fromId, toId, name, spriteUrl, condition }], learnset: [{ move, type, category, power, accuracy, pp, method, level }], description }`
- `GET /pokemon/:idOrName/competitive?format=gen9ou`
  → `{ data: CompetitiveData }`
  - `CompetitiveData = { format, month, usagePct, usageRank, rawCount, abilities: [{name,pct}], items: [{name,pct}], natures: [{name,pct}], spreads: [{ nature, evs: {hp,atk,def,spa,spd,spe}, pct }], teraTypes: [{name,pct}], moves: [{name,pct}], teammates: [{name,displayName,spriteUrl,pct}], checksAndCounters: [{ name, displayName, spriteUrl, koPct, switchPct, score, kind: "counter"|"check" }], difficulty: "easy"|"medium"|"hard", strategyText: string|null }`
  - `difficulty` heuristic computed server-side (spread variance, nº de sets viáveis, dependência de previsão).
- `GET /usage/top?format=gen9vgc2026&limit=12` → `{ data: PokemonSummary[] }` ordered by rank.

### Teams
- `GET /teams?format=&page=&limit=` → `{ data: TeamSummary[], meta }`
  - `TeamSummary = { id, name, format, author, event: string|null, placement: string|null, dateISO, pokemon: [{ name, displayName, spriteUrl, item }] }`
- `GET /teams/:id` → `{ data: TeamDetail }`
  - `TeamDetail = TeamSummary + { showdownPaste: string, strategy: string|null, leadGuide: string|null, sourceUrl: string|null }`
  - `showdownPaste` = formato de exportação do Pokémon Showdown (texto pronto para importar).

### News
- `GET /news?limit=20` → `{ data: NewsItem[] }`
  - `NewsItem = { id, title, source, url, dateISO, summary, tag: "vgc"|"smogon"|"event"|"general" }`

### Sync (admin, header `x-api-key`)
- `POST /sync/run?job=usage|pokedex|teams|news|all` → `{ data: { started: true, job } }`
- `GET /sync/status` → `{ data: [{ job, lastRunISO, status, message }] }`

## Caching
- Redis: respostas GET cacheadas por chave de URL. TTL: pokémon 24h, competitive/usage 12h, teams/news 1h.
- Header `X-Cache: HIT|MISS`.

## Data sources (server-side)
- PokéAPI (`pokeapi.co`) — dex, stats, sprites, learnsets, evolução.
- Showdown data (`play.pokemonshowdown.com/data/*.json`) — moves, items, abilities, formats.
- Smogon usage stats (`smogon.com/stats/<YYYY-MM>/chaos/<format>-1760.json`) — usage, moves, items, spreads, teammates, checks & counters, tera.
- Teams/News: seeds + parsers atualizáveis (VictoryRoad/LabMaus não têm API — usar seeds e estrutura de scraper plugável).
