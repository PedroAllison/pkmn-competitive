import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

/**
 * Testes de rota com supertest usando mocks de service — sem PG/Redis reais.
 * O cache é no-op (REDIS_URL indefinido em test) e o rate limit é desativado
 * em NODE_ENV=test.
 */

const summary = {
  id: 984,
  name: 'great-tusk',
  displayName: 'Great Tusk',
  dexNumber: 984,
  types: ['Ground', 'Fighting'],
  spriteUrl: 'https://example.com/sprite.png',
  artworkUrl: 'https://example.com/art.png',
  baseStats: { hp: 115, atk: 131, def: 131, spa: 53, spd: 53, spe: 87 },
  usagePct: 45.23,
  usageRank: 1,
};

const detail = {
  ...summary,
  height: 2.2,
  weight: 320,
  abilities: [{ name: 'Protosynthesis', isHidden: false, description: null }],
  evolutions: [],
  learnset: [],
  description: 'Um Pokémon Paradoxo.',
};

const competitive = {
  format: 'gen9ou',
  month: '2026-06',
  usagePct: 45.23,
  usageRank: 1,
  rawCount: 5000,
  abilities: [{ name: 'Protosynthesis', pct: 100 }],
  items: [{ name: 'Heavy-Duty Boots', pct: 60 }],
  natures: [{ name: 'Jolly', pct: 70 }],
  spreads: [
    { nature: 'Jolly', evs: { hp: 0, atk: 252, def: 0, spa: 0, spd: 4, spe: 252 }, pct: 50 },
  ],
  teraTypes: [{ name: 'Steel', pct: 40 }],
  moves: [{ name: 'Headlong Rush', pct: 90 }],
  teammates: [],
  checksAndCounters: [],
  difficulty: 'easy' as const,
  strategyText: 'Great Tusk é geralmente usado como atacante físico.',
};

const team = {
  id: 'ou-gholdengo-balance',
  name: 'Gholdengo Balance',
  format: 'gen9ou',
  author: 'sample_teams (Smogon)',
  event: null,
  placement: null,
  dateISO: '2026-04-10',
  pokemon: [
    {
      name: 'gholdengo',
      displayName: 'Gholdengo',
      spriteUrl: 'https://example.com/gholdengo.png',
      item: 'Air Balloon',
    },
  ],
};

const teamDetail = {
  ...team,
  showdownPaste: 'Gholdengo @ Air Balloon\nAbility: Good as Gold\n- Make It Rain',
  strategy: 'Balance de OU.',
  leadGuide: 'Great Tusk abre.',
  sourceUrl: null,
};

const newsItem = {
  id: 'noticia-1',
  title: 'Suspect test de Kingambit',
  source: 'Smogon',
  url: 'https://smogon.com/x',
  dateISO: '2026-07-05',
  summary: 'Resumo.',
  tag: 'smogon' as const,
};

vi.mock('../src/services/healthService.js', () => ({
  getHealth: vi.fn(async () => ({ status: 'ok', db: true, redis: false })),
}));

vi.mock('../src/services/formatService.js', () => ({
  listFormats: vi.fn(async () => [
    { id: 'gen9ou', label: 'Smogon OU (Singles)', gameType: 'singles', generation: 9, game: 'sv' },
  ]),
  formatExists: vi.fn(async () => true),
}));

vi.mock('../src/services/pokemonService.js', async () => {
  const { notFound } = await import('../src/utils/httpError.js');
  return {
    listPokemon: vi.fn(async () => ({ items: [summary], total: 1 })),
    getPokemonDetail: vi.fn(async (idOrName: string) => {
      if (idOrName === 'missingno') throw notFound(`Pokémon "${idOrName}" não encontrado`);
      return detail;
    }),
    getCompetitiveData: vi.fn(async (_id: string, format: string) => ({
      ...competitive,
      format,
    })),
    getTopUsage: vi.fn(async () => [summary]),
  };
});

vi.mock('../src/services/teamService.js', async () => {
  const { notFound } = await import('../src/utils/httpError.js');
  return {
    listTeams: vi.fn(async () => ({ items: [team], total: 1 })),
    getTeam: vi.fn(async (id: string) => {
      if (id !== teamDetail.id) throw notFound(`Time "${id}" não encontrado`);
      return teamDetail;
    }),
  };
});

vi.mock('../src/services/newsService.js', () => ({
  listNews: vi.fn(async (limit: number) => [newsItem].slice(0, limit)),
}));

vi.mock('../src/services/syncService.js', () => ({
  startJob: vi.fn(),
  runJob: vi.fn(async () => undefined),
  getStatus: vi.fn(async () => [
    { job: 'usage', lastRunISO: '2026-07-14T05:00:00.000Z', status: 'success', message: 'ok' },
  ]),
}));

let app: Express;

beforeAll(async () => {
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

describe('GET /api/v1/health', () => {
  it('retorna envelope { data } com flags de db/redis', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: 'ok', db: true, redis: false } });
  });
});

describe('GET /api/v1/formats', () => {
  it('lista formatos e seta X-Cache', async () => {
    const res = await request(app).get('/api/v1/formats');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('gen9ou');
    expect(res.headers['x-cache']).toBe('MISS'); // cache no-op sem Redis
  });
});

describe('GET /api/v1/pokemon', () => {
  it('lista com meta de paginação', async () => {
    const res = await request(app).get('/api/v1/pokemon?format=gen9ou&page=1&limit=20');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [summary],
      meta: { page: 1, limit: 20, total: 1 },
    });
  });

  it('valida query inválida com envelope de erro', async () => {
    const res = await request(app).get('/api/v1/pokemon?limit=abc');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(typeof res.body.error.message).toBe('string');
  });
});

describe('GET /api/v1/pokemon/:idOrName', () => {
  it('retorna detalhe', async () => {
    const res = await request(app).get('/api/v1/pokemon/great-tusk');
    expect(res.status).toBe(200);
    expect(res.body.data.displayName).toBe('Great Tusk');
    expect(res.body.data.abilities).toHaveLength(1);
  });

  it('404 com envelope de erro para desconhecido', async () => {
    const res = await request(app).get('/api/v1/pokemon/missingno');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/v1/pokemon/:idOrName/competitive', () => {
  it('retorna CompetitiveData com o formato pedido', async () => {
    const res = await request(app).get('/api/v1/pokemon/great-tusk/competitive?format=gen9uu');
    expect(res.status).toBe(200);
    expect(res.body.data.format).toBe('gen9uu');
    expect(res.body.data.difficulty).toBe('easy');
    expect(res.body.data.spreads[0].nature).toBe('Jolly');
  });

  it('usa gen9ou como formato default', async () => {
    const res = await request(app).get('/api/v1/pokemon/great-tusk/competitive');
    expect(res.status).toBe(200);
    expect(res.body.data.format).toBe('gen9ou');
  });
});

describe('GET /api/v1/usage/top', () => {
  it('retorna lista ordenada por rank', async () => {
    const res = await request(app).get('/api/v1/usage/top?format=gen9vgc2026&limit=12');
    expect(res.status).toBe(200);
    expect(res.body.data[0].usageRank).toBe(1);
  });
});

describe('Teams', () => {
  it('GET /teams lista com meta', async () => {
    const res = await request(app).get('/api/v1/teams?format=gen9ou');
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('ou-gholdengo-balance');
    expect(res.body.meta.total).toBe(1);
  });

  it('GET /teams/:id retorna showdownPaste', async () => {
    const res = await request(app).get('/api/v1/teams/ou-gholdengo-balance');
    expect(res.status).toBe(200);
    expect(res.body.data.showdownPaste).toContain('Gholdengo @ Air Balloon');
    expect(res.body.data.strategy).toBe('Balance de OU.');
  });

  it('GET /teams/:id 404 para inexistente', async () => {
    const res = await request(app).get('/api/v1/teams/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/v1/news', () => {
  it('lista notícias', async () => {
    const res = await request(app).get('/api/v1/news?limit=20');
    expect(res.status).toBe(200);
    expect(res.body.data[0].tag).toBe('smogon');
  });
});

describe('Sync (admin)', () => {
  it('POST /sync/run exige x-api-key', async () => {
    const res = await request(app).post('/api/v1/sync/run?job=usage');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /sync/run dispara job assíncrono com chave válida', async () => {
    const syncService = await import('../src/services/syncService.js');
    const res = await request(app)
      .post('/api/v1/sync/run?job=usage')
      .set('x-api-key', 'dev-admin-key');
    expect(res.status).toBe(202);
    expect(res.body).toEqual({ data: { started: true, job: 'usage' } });
    expect(syncService.startJob).toHaveBeenCalledWith('usage');
  });

  it('POST /sync/run rejeita job inválido', async () => {
    const res = await request(app)
      .post('/api/v1/sync/run?job=banana')
      .set('x-api-key', 'dev-admin-key');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /sync/status retorna última execução por job', async () => {
    const res = await request(app)
      .get('/api/v1/sync/status')
      .set('x-api-key', 'dev-admin-key');
    expect(res.status).toBe(200);
    expect(res.body.data[0].job).toBe('usage');
  });
});

describe('Rotas desconhecidas', () => {
  it('404 com envelope de erro do contrato', async () => {
    const res = await request(app).get('/api/v1/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.error).toEqual({
      code: 'NOT_FOUND',
      message: expect.stringContaining('/api/v1/nao-existe'),
    });
  });
});
