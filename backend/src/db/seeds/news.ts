import type { NewsItem } from '../../types/contract.js';

/** Notícias de exemplo (conteúdo curado; ids estáveis para upsert idempotente). */
export const seedNews: NewsItem[] = [
  {
    id: 'vgc-2026-regulation-j-anunciada',
    title: 'VGC 2026: Regulation J anunciada com retorno dos restritos',
    source: 'Victory Road',
    url: 'https://victoryroadvgc.com/2026/06/regulation-j/',
    dateISO: '2026-06-28',
    summary:
      'A nova regulation permite um Pokémon restrito por time e reintroduz Miraidon e Koraidon no formato oficial. Vale a partir dos Regionals de agosto.',
    tag: 'vgc',
  },
  {
    id: 'smogon-ou-suspect-kingambit',
    title: 'Smogon OU abre suspect test de Kingambit',
    source: 'Smogon',
    url: 'https://www.smogon.com/forums/threads/ou-suspect-kingambit.3740000/',
    dateISO: '2026-07-05',
    summary:
      'Após meses dominando o tier com mais de 30% de uso, Kingambit entra em suspect. Reqs: GXE 80 com 30 jogos na ladder de suspect.',
    tag: 'smogon',
  },
  {
    id: 'worlds-2026-sao-francisco',
    title: 'Mundial de Pokémon 2026 confirmado em São Francisco',
    source: 'Pokémon Oficial',
    url: 'https://worlds.pokemon.com/2026/',
    dateISO: '2026-05-20',
    summary:
      'O World Championships 2026 acontece de 14 a 16 de agosto em São Francisco, com VGC, TCG, GO e Unite. Inscrições por convite via Championship Points.',
    tag: 'event',
  },
  {
    id: 'labmaus-guia-teambuilding-regj',
    title: 'Guia de teambuilding para a Regulation J (pt-BR)',
    source: 'LabMaus',
    url: 'https://labmaus.net/artigos/guia-teambuilding-reg-j',
    dateISO: '2026-07-02',
    summary:
      'O LabMaus publicou um guia completo em português sobre cores de time com restritos, com foco em Miraidon e Calyrex-Shadow.',
    tag: 'vgc',
  },
  {
    id: 'regional-sao-paulo-2026-resultados',
    title: 'Regional de São Paulo: brasileiro campeão com Miraidon',
    source: 'Victory Road',
    url: 'https://victoryroadvgc.com/2026/07/sao-paulo-regional/',
    dateISO: '2026-07-06',
    summary:
      'Marco Silva venceu o Regional de São Paulo com um time de Miraidon e Whimsicott, garantindo o convite para o Mundial.',
    tag: 'event',
  },
  {
    id: 'smogon-uu-shifts-julho-2026',
    title: 'UU: tier shifts de julho movimentam o metagame',
    source: 'Smogon',
    url: 'https://www.smogon.com/forums/threads/uu-tier-shifts-july-2026.3741000/',
    dateISO: '2026-07-03',
    summary:
      'Salamence caiu para UU e Hydreigon subiu de uso. A tier leader anunciou votação de aftermath para as próximas semanas.',
    tag: 'smogon',
  },
  {
    id: 'showdown-atualiza-damage-calc',
    title: 'Pokémon Showdown atualiza o damage calc para a Regulation J',
    source: 'Pokémon Showdown',
    url: 'https://calc.pokemonshowdown.com/',
    dateISO: '2026-06-30',
    summary:
      'O calculador oficial agora inclui os sets padrão da Regulation J e correções no cálculo de Tera Blast com Booster Energy.',
    tag: 'general',
  },
  {
    id: 'bss-season-20-comecou',
    title: 'Battle Stadium Singles: Season 20 começou',
    source: 'Pokémon Oficial',
    url: 'https://www.pokemon.com/br/estrategia/battle-stadium-season-20',
    dateISO: '2026-07-01',
    summary:
      'Nova season ranqueada no jogo com regras de Series 20: todos os Paradox liberados, restritos banidos. Recompensas até o top 10.000.',
    tag: 'general',
  },
];
