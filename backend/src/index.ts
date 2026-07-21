import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { getCache } from './config/redis.js';
import { closePool } from './config/db.js';
import { startScheduler } from './jobs/scheduler.js';

/** Bootstrap: sobe o HTTP server, inicializa cache (best-effort) e agenda os jobs. */
const app = createApp();

getCache(); // inicializa Redis (ou loga warning e segue com cache no-op)

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `PokéCompanion API ouvindo em http://localhost:${env.PORT}/api/v1`);
});

startScheduler();

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Encerrando...');
  server.close(async () => {
    await Promise.allSettled([closePool(), getCache().quit()]);
    process.exit(0);
  });
  // Força saída se algo travar o close.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
