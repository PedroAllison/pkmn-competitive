import type { NewsProvider, TeamProvider } from './types.js';
import { logger } from '../../config/logger.js';

/**
 * Stubs documentados para futuros scrapers. Nenhuma dessas fontes tem API
 * pública; a implementação real deve fazer scraping educado (respeitar
 * robots.txt, user-agent identificado, cache local, baixa frequência).
 * Por ora retornam listas vazias — o pipeline já os invoca normalmente.
 */

/**
 * Victory Road (victoryroadvgc.com) — notícias e resultados de VGC.
 * TODO: raspar o feed RSS/WordPress (`/feed/`) que o site expõe; mapear
 * categorias para a tag `vgc` e eventos para `event`.
 */
export const victoryRoadNewsProvider: NewsProvider = {
  name: 'victoryroad',
  async fetchNews() {
    logger.debug('victoryroad provider é stub — retornando []');
    return [];
  },
};

/**
 * LabMaus (labmaus.net) — conteúdo competitivo em pt-BR.
 * TODO: raspar a listagem de artigos (HTML estático) e normalizar datas
 * pt-BR; tag default `general`, artigos de VGC → `vgc`.
 */
export const labMausNewsProvider: NewsProvider = {
  name: 'labmaus',
  async fetchNews() {
    logger.debug('labmaus provider é stub — retornando []');
    return [];
  },
};

/**
 * Pikalytics (pikalytics.com) — times/sets de VGC e ladder.
 * TODO: o site alimenta a UI com JSON não documentado
 * (`/api/p/<season>/<format>`); implementar com cautela (endpoint pode mudar
 * sem aviso) e converter os sets para showdown paste.
 */
export const pikalyticsTeamProvider: TeamProvider = {
  name: 'pikalytics',
  async fetchTeams() {
    logger.debug('pikalytics provider é stub — retornando []');
    return [];
  },
};
