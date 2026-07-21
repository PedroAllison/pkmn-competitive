import { pinoHttp } from 'pino-http';
import { logger } from '../config/logger.js';

/** Logging estruturado de requests (pino). Silencioso em NODE_ENV=test. */
export const requestLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/api/v1/health',
  },
});
