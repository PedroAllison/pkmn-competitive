import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { requireApiKey } from '../middleware/apiKey.js';
import * as health from '../controllers/healthController.js';
import * as formats from '../controllers/formatsController.js';
import * as pokemon from '../controllers/pokemonController.js';
import * as teams from '../controllers/teamsController.js';
import * as news from '../controllers/newsController.js';
import * as sync from '../controllers/syncController.js';

/** Rotas REST v1 conforme docs/API_CONTRACT.md. */
export function v1Router(): Router {
  const router = Router();
  const cached = cacheMiddleware();

  router.get('/health', asyncHandler(health.getHealth));

  router.get('/formats', cached, asyncHandler(formats.listFormats));

  router.get('/pokemon', cached, asyncHandler(pokemon.listPokemon));
  router.get('/pokemon/:idOrName', cached, asyncHandler(pokemon.getPokemon));
  router.get('/pokemon/:idOrName/competitive', cached, asyncHandler(pokemon.getCompetitive));
  router.get('/usage/top', cached, asyncHandler(pokemon.getTopUsage));

  router.get('/teams', cached, asyncHandler(teams.listTeams));
  router.get('/teams/:id', cached, asyncHandler(teams.getTeam));

  router.get('/news', cached, asyncHandler(news.listNews));

  router.post('/sync/run', requireApiKey, asyncHandler(sync.runSync));
  router.get('/sync/status', requireApiKey, asyncHandler(sync.getSyncStatus));

  return router;
}
