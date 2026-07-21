import { getPool, closePool } from '../config/db.js';
import { seedFormats } from './seeds/formats.js';
import { seedNews } from './seeds/news.js';
import { buildSeedTeams } from './seeds/teams.js';
import { upsertTeam } from '../services/teamService.js';
import { upsertNews } from '../services/newsService.js';

/**
 * Seed idempotente: formatos canônicos, ~10 times reais de exemplo com paste
 * do Showdown e ~8 notícias. Uso: `npm run seed` (após `npm run migrate`).
 */
async function seed(): Promise<void> {
  const pool = getPool();

  for (const f of seedFormats) {
    await pool.query(
      `INSERT INTO formats (id, label, game_type, generation, game, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         label = EXCLUDED.label, game_type = EXCLUDED.game_type,
         generation = EXCLUDED.generation, game = EXCLUDED.game,
         sort_order = EXCLUDED.sort_order`,
      [f.id, f.label, f.gameType, f.generation, f.game, f.sortOrder],
    );
  }
  const currentIds = seedFormats.map((f) => f.id);
  const { rowCount: removed } = await pool.query(
    'DELETE FROM formats WHERE id != ALL($1)',
    [currentIds],
  );
  console.log(`✓ ${seedFormats.length} formatos${removed ? ` (${removed} deprecados removidos)` : ''}`);

  const teams = buildSeedTeams();
  for (const t of teams) {
    await upsertTeam(t);
  }
  const currentTeamIds = teams.map((t) => t.id);
  const { rowCount: removedTeams } = await pool.query(
    'DELETE FROM teams WHERE id != ALL($1)',
    [currentTeamIds],
  );
  console.log(`✓ ${teams.length} times${removedTeams ? ` (${removedTeams} removidos do seed)` : ''}`);

  for (const n of seedNews) {
    await upsertNews(n);
  }
  console.log(`✓ ${seedNews.length} notícias`);

  console.log('Seed concluído.');
}

seed()
  .then(() => closePool())
  .catch(async (err) => {
    console.error(err);
    await closePool();
    process.exit(1);
  });
