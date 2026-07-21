-- Times competitivos (seeds curados + providers plugáveis)
CREATE TABLE teams (
  id             text PRIMARY KEY,        -- slug estável (idempotência dos syncs)
  name           text NOT NULL,
  format_id      text NOT NULL REFERENCES formats (id) ON DELETE CASCADE,
  author         text NOT NULL,
  event          text,
  placement      text,
  date           date NOT NULL,
  showdown_paste text NOT NULL,
  strategy       text,
  lead_guide     text,
  source_url     text,
  members        jsonb NOT NULL DEFAULT '[]',  -- [{ name, displayName, spriteUrl, item }]
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_teams_format_date ON teams (format_id, date DESC);
CREATE INDEX idx_teams_date ON teams (date DESC);
