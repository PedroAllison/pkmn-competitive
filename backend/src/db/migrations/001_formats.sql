-- Formatos canônicos do contrato (docs/API_CONTRACT.md)
CREATE TABLE formats (
  id          text PRIMARY KEY,
  label       text NOT NULL,
  game_type   text NOT NULL CHECK (game_type IN ('singles', 'doubles')),
  generation  int  NOT NULL DEFAULT 9,
  sort_order  int  NOT NULL DEFAULT 0
);
