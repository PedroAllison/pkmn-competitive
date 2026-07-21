import { newsProviders } from './providers/index.js';
import { upsertNews } from '../services/newsService.js';
import { logger } from '../config/logger.js';

/** Job `news`: roda todos os NewsProviders registrados e faz upsert das notícias. */
export async function runNewsSync(): Promise<string> {
  const results: string[] = [];
  for (const provider of newsProviders) {
    try {
      const items = await provider.fetchNews();
      for (const item of items) {
        await upsertNews(item);
      }
      results.push(`${provider.name}: ${items.length} notícias`);
    } catch (err) {
      logger.warn({ provider: provider.name, err: (err as Error).message }, 'NewsProvider falhou');
      results.push(`${provider.name}: ERRO — ${(err as Error).message}`);
    }
  }
  return results.join('; ');
}
