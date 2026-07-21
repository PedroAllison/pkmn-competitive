import { teamProviders } from './providers/index.js';
import { upsertTeam } from '../services/teamService.js';
import { logger } from '../config/logger.js';

/** Job `teams`: roda todos os TeamProviders registrados e faz upsert dos times. */
export async function runTeamsSync(): Promise<string> {
  const results: string[] = [];
  for (const provider of teamProviders) {
    try {
      const teams = await provider.fetchTeams();
      for (const team of teams) {
        await upsertTeam(team);
      }
      results.push(`${provider.name}: ${teams.length} times`);
    } catch (err) {
      logger.warn({ provider: provider.name, err: (err as Error).message }, 'TeamProvider falhou');
      results.push(`${provider.name}: ERRO — ${(err as Error).message}`);
    }
  }
  return results.join('; ');
}
