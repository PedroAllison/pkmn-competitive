import { getPool } from '../config/db.js';
import type { NewsItem, NewsTag } from '../types/contract.js';

interface NewsRow {
  id: string;
  title: string;
  source: string;
  url: string;
  date: Date;
  summary: string | null;
  tag: NewsTag;
}

function toItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    url: row.url,
    dateISO: row.date.toISOString().slice(0, 10),
    summary: row.summary,
    tag: row.tag,
  };
}

/** Lista notícias, mais recentes primeiro. */
export async function listNews(limit: number): Promise<NewsItem[]> {
  const { rows } = await getPool().query<NewsRow>(
    'SELECT * FROM news ORDER BY date DESC, id LIMIT $1',
    [limit],
  );
  return rows.map(toItem);
}

/** Upsert de uma notícia (idempotente por id) — usado por seeds e pelo job de news. */
export async function upsertNews(n: NewsItem): Promise<void> {
  await getPool().query(
    `INSERT INTO news (id, title, source, url, date, summary, tag)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET
       title = EXCLUDED.title, source = EXCLUDED.source, url = EXCLUDED.url,
       date = EXCLUDED.date, summary = EXCLUDED.summary, tag = EXCLUDED.tag`,
    [n.id, n.title, n.source, n.url, n.dateISO, n.summary, n.tag],
  );
}
