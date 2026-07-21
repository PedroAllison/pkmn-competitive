-- Usage stats do Smogon por Pokémon × formato × mês.
-- `data` guarda o ParsedUsageEntry completo (moves/items/spreads/teammates/checks/tera).
CREATE TABLE pokemon_usage (
  id           bigserial PRIMARY KEY,
  pokemon_name text NOT NULL,             -- slug canônico (pode não existir ainda em `pokemon`)
  format_id    text NOT NULL REFERENCES formats (id) ON DELETE CASCADE,
  month        text NOT NULL,             -- 'YYYY-MM'
  usage_pct    numeric NOT NULL,
  rank         int NOT NULL,
  raw_count    bigint NOT NULL DEFAULT 0,
  data         jsonb NOT NULL DEFAULT '{}',
  UNIQUE (pokemon_name, format_id, month)
);

CREATE INDEX idx_usage_format_month_rank ON pokemon_usage (format_id, month, rank);
CREATE INDEX idx_usage_pokemon ON pokemon_usage (pokemon_name);
