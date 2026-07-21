import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { runJob } from '../services/syncService.js';

/**
 * Agenda o sync diário completo às 05:00 UTC (o Smogon publica stats novos
 * nos primeiros dias do mês; diário mantém teams/news e pega o mês novo
 * automaticamente).
 */
export function startScheduler(): void {
  cron.schedule(
    '0 5 * * *',
    () => {
      logger.info('Sync diário agendado iniciando (05:00 UTC)');
      void runJob('all');
    },
    { timezone: 'Etc/UTC' },
  );
  logger.info('Scheduler registrado: sync "all" diário às 05:00 UTC');
}
