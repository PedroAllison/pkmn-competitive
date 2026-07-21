import type { NewsProvider, TeamProvider } from './types.js';
import { seedNewsProvider, seedTeamProvider } from './seedProviders.js';
import {
  labMausNewsProvider,
  pikalyticsTeamProvider,
  victoryRoadNewsProvider,
} from './stubs.js';

/** Registro de providers ativos — para plugar um scraper novo, adicione aqui. */
export const newsProviders: NewsProvider[] = [
  seedNewsProvider,
  victoryRoadNewsProvider,
  labMausNewsProvider,
];

export const teamProviders: TeamProvider[] = [seedTeamProvider, pikalyticsTeamProvider];

export type { NewsProvider, TeamProvider } from './types.js';
