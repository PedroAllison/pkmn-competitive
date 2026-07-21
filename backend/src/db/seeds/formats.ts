import type { Format } from '../../types/contract.js';

/**
 * Formatos canônicos do contrato (docs/API_CONTRACT.md) — **apenas
 * Pokémon Champions**.
 *
 * Confirmado em champions.pokemon.com/en-us/gameplay/: Champions é o
 * software oficial de VGC (doubles) para o Pokémon World Championships e
 * Championship Series a partir de 2026, com dois formatos de batalha
 * (Single/Double) em três modos (Ranked/Casual/Private) e regulations que
 * mudam a cada poucas temporadas. Scarlet/Violet (tiers Smogon old-gen) e
 * Legends Z-A (mecânica de batalha em tempo real, sem formato ranqueado
 * ainda) foram removidos do catálogo — fora de escopo do produto agora.
 *
 * IDs confirmados em `smogon.com/stats/<mês>/chaos/` — cada id é o prefixo
 * exato do arquivo chaos correspondente (sem resolução de sufixo).
 */
export const seedFormats: (Format & { sortOrder: number })[] = [
  {
    id: 'gen9championsvgc2026regmb',
    label: 'VGC 2026 (Reg. M-B)',
    gameType: 'doubles',
    generation: 9,
    game: 'champions',
    sortOrder: 1,
  },
  {
    id: 'gen9championsvgc2026regma',
    label: 'VGC 2026 (Reg. M-A)',
    gameType: 'doubles',
    generation: 9,
    game: 'champions',
    sortOrder: 2,
  },
  {
    id: 'gen9championsvgc2026regmbbo3',
    label: 'VGC 2026 Bo3 (Reg. M-B)',
    gameType: 'doubles',
    generation: 9,
    game: 'champions',
    sortOrder: 3,
  },
  {
    id: 'gen9championsvgc2026regmabo3',
    label: 'VGC 2026 Bo3 (Reg. M-A)',
    gameType: 'doubles',
    generation: 9,
    game: 'champions',
    sortOrder: 4,
  },
  {
    id: 'gen9championsbssregmb',
    label: 'Battle Stadium Singles (Reg. M-B)',
    gameType: 'singles',
    generation: 9,
    game: 'champions',
    sortOrder: 5,
  },
  {
    id: 'gen9championsbssregma',
    label: 'Battle Stadium Singles (Reg. M-A)',
    gameType: 'singles',
    generation: 9,
    game: 'champions',
    sortOrder: 6,
  },
  {
    id: 'gen9championsou',
    label: 'Champions OU',
    gameType: 'singles',
    generation: 9,
    game: 'champions',
    sortOrder: 7,
  },
  {
    id: 'gen9champions4v4doublesuu',
    label: '4v4 Doubles UU',
    gameType: 'doubles',
    generation: 9,
    game: 'champions',
    sortOrder: 8,
  },
];
