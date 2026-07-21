import { getPool } from '../config/db.js';
import type { CompetitiveGame, Format } from '../types/contract.js';

interface FormatRow {
  id: string;
  label: string;
  game_type: 'singles' | 'doubles';
  generation: number;
  game: CompetitiveGame;
}

/** Lista os formatos canônicos cadastrados. */
export async function listFormats(): Promise<Format[]> {
  const { rows } = await getPool().query<FormatRow>(
    'SELECT id, label, game_type, generation, game FROM formats ORDER BY sort_order, id',
  );
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    gameType: r.game_type,
    generation: r.generation,
    game: r.game,
  }));
}

/** Verifica se um formato existe. */
export async function formatExists(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query('SELECT 1 FROM formats WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
