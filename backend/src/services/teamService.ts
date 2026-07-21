import { getPool } from '../config/db.js';
import type { Paginated, TeamDetail, TeamMember, TeamSummary } from '../types/contract.js';
import { notFound } from '../utils/httpError.js';

interface TeamRow {
  id: string;
  name: string;
  format_id: string;
  author: string;
  event: string | null;
  placement: string | null;
  date: Date;
  showdown_paste: string;
  strategy: string | null;
  lead_guide: string | null;
  source_url: string | null;
  members: TeamMember[];
}

function toSummary(row: TeamRow): TeamSummary {
  return {
    id: row.id,
    name: row.name,
    format: row.format_id,
    author: row.author,
    event: row.event,
    placement: row.placement,
    dateISO: row.date.toISOString().slice(0, 10),
    pokemon: row.members ?? [],
  };
}

export interface ListTeamsOptions {
  format?: string;
  page: number;
  limit: number;
}

/** Lista times (mais recentes primeiro), com filtro opcional por formato. */
export async function listTeams(opts: ListTeamsOptions): Promise<Paginated<TeamSummary>> {
  const params: unknown[] = [];
  let where = '';
  if (opts.format) {
    params.push(opts.format);
    where = `WHERE format_id = $${params.length}`;
  }
  params.push(opts.limit, (opts.page - 1) * opts.limit);

  const { rows } = await getPool().query<TeamRow & { total_count: string }>(
    `SELECT *, COUNT(*) OVER() AS total_count
       FROM teams ${where}
      ORDER BY date DESC, id
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return {
    items: rows.map(toSummary),
    total: rows.length > 0 ? Number(rows[0].total_count) : 0,
  };
}

/**
 * Detalhe de um time, incluindo o paste de exportação do Showdown.
 * @throws {HttpError} 404 quando o time não existe.
 */
export async function getTeam(id: string): Promise<TeamDetail> {
  const { rows } = await getPool().query<TeamRow>('SELECT * FROM teams WHERE id = $1', [id]);
  const row = rows[0];
  if (!row) throw notFound(`Time "${id}" não encontrado`);
  return {
    ...toSummary(row),
    showdownPaste: row.showdown_paste,
    strategy: row.strategy,
    leadGuide: row.lead_guide,
    sourceUrl: row.source_url,
  };
}

/** Input de upsert usado por seeds e pelo job de teams. */
export interface TeamInput {
  id: string;
  name: string;
  format: string;
  author: string;
  event: string | null;
  placement: string | null;
  dateISO: string;
  showdownPaste: string;
  strategy: string | null;
  leadGuide: string | null;
  sourceUrl: string | null;
  members: TeamMember[];
}

/** Upsert de um time (idempotente por id). */
export async function upsertTeam(t: TeamInput): Promise<void> {
  await getPool().query(
    `INSERT INTO teams (id, name, format_id, author, event, placement, date,
                        showdown_paste, strategy, lead_guide, source_url, members)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name, format_id = EXCLUDED.format_id, author = EXCLUDED.author,
       event = EXCLUDED.event, placement = EXCLUDED.placement, date = EXCLUDED.date,
       showdown_paste = EXCLUDED.showdown_paste, strategy = EXCLUDED.strategy,
       lead_guide = EXCLUDED.lead_guide, source_url = EXCLUDED.source_url,
       members = EXCLUDED.members`,
    [
      t.id,
      t.name,
      t.format,
      t.author,
      t.event,
      t.placement,
      t.dateISO,
      t.showdownPaste,
      t.strategy,
      t.leadGuide,
      t.sourceUrl,
      JSON.stringify(t.members),
    ],
  );
}
