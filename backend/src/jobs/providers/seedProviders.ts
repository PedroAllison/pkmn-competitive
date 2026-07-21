import type { NewsProvider, TeamProvider } from './types.js';
import { seedNews } from '../../db/seeds/news.js';
import { buildSeedTeams } from '../../db/seeds/teams.js';

/**
 * Providers que servem o conteúdo curado dos seeds. Garantem que o job de
 * teams/news seja sempre idempotente e que o app tenha conteúdo desde o
 * primeiro sync, mesmo sem scrapers externos habilitados.
 */

export const seedNewsProvider: NewsProvider = {
  name: 'seed',
  async fetchNews() {
    return seedNews;
  },
};

export const seedTeamProvider: TeamProvider = {
  name: 'seed',
  async fetchTeams() {
    return buildSeedTeams();
  },
};
