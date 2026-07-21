import express, { type Express } from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimit } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { v1Router } from './routes/v1.js';

/**
 * Monta o app Express (sem side effects de rede — quem conecta banco/Redis
 * são os services/middlewares sob demanda; quem sobe o servidor é index.ts).
 */
export function createApp(): Express {
  const app = express();

  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use(cors()); // CORS aberto, conforme contrato (API pública de leitura)
  app.use(express.json({ limit: '1mb' }));
  app.use(requestLogger);
  app.use(rateLimit());

  app.use('/api/v1', v1Router());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
