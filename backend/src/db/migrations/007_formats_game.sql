-- Associa cada formato a um jogo (Pokémon Champions, Scarlet/Violet, Legends Z-A).
-- Default 'sv' para não quebrar linhas existentes antes do seed atualizar os valores reais.
ALTER TABLE formats
  ADD COLUMN game text NOT NULL DEFAULT 'sv'
    CHECK (game IN ('champions', 'sv', 'legends-za'));
