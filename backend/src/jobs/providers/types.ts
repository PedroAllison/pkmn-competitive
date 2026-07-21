import type { NewsItem } from '../../types/contract.js';
import type { TeamInput } from '../../services/teamService.js';

/**
 * Interfaces de scraper plugável. VictoryRoad/LabMaus/Pikalytics não têm API
 * pública — a estratégia é: providers de seed garantem conteúdo, e novos
 * scrapers entram implementando estas interfaces e sendo registrados nas
 * listas de `newsProviders`/`teamProviders` (src/jobs/providers/index.ts).
 */

export interface NewsProvider {
  readonly name: string;
  /** Retorna notícias com id estável (idempotência do upsert). */
  fetchNews(): Promise<NewsItem[]>;
}

export interface TeamProvider {
  readonly name: string;
  /** Retorna times com id estável e showdown paste completo. */
  fetchTeams(): Promise<TeamInput[]>;
}
