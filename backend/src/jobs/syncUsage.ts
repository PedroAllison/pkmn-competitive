import { fetchFormatUsage } from '../datasources/smogonStats.js';
import { upsertUsageEntries } from '../services/usageService.js';
import { getPool } from '../config/db.js';
import { logger } from '../config/logger.js';

/**
 * Job `usage`: baixa os usage stats (chaos) do mês mais recente do Smogon
 * para TODOS os formatos cadastrados e faz upsert em `pokemon_usage`.
 */
export async function runUsageSync(): Promise<string> {
  const { rows } = await getPool().query<{ id: string }>('SELECT id FROM formats ORDER BY id');
  const results: string[] = [];

  for (const { id } of rows) {
    try {
      const usage = await fetchFormatUsage(id);
      const count = await upsertUsageEntries(id, usage.month, usage.entries);
      results.push(`${id}: ${count} entradas (${usage.fileName})`);
    } catch (err) {
      logger.warn({ format: id, err: (err as Error).message }, 'Falha no sync de usage do formato');
      results.push(`${id}: ERRO — ${(err as Error).message}`);
    }
  }
  return results.join('; ');
}
