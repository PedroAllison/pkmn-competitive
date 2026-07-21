-- Notícias (seeds + NewsProviders plugáveis)
CREATE TABLE news (
  id         text PRIMARY KEY,            -- slug estável
  title      text NOT NULL,
  source     text NOT NULL,
  url        text NOT NULL,
  date       date NOT NULL,
  summary    text,
  tag        text NOT NULL CHECK (tag IN ('vgc', 'smogon', 'event', 'general')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_date ON news (date DESC);
CREATE INDEX idx_news_tag ON news (tag);
