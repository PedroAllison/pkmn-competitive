-- Ficha completa dos Pokémon (fonte: PokéAPI + enriquecimento Showdown)
CREATE TABLE pokemon (
  id           int  PRIMARY KEY,          -- id da PokéAPI (formas têm id próprio)
  name         text NOT NULL UNIQUE,      -- slug canônico ("great-tusk")
  display_name text NOT NULL,
  dex_number   int  NOT NULL,             -- nº da dex nacional (species id)
  types        text[] NOT NULL DEFAULT '{}',
  sprite_url   text,
  artwork_url  text,
  base_stats   jsonb NOT NULL DEFAULT '{}',  -- { hp, atk, def, spa, spd, spe }
  height       numeric,                   -- metros
  weight       numeric,                   -- kg
  abilities    jsonb NOT NULL DEFAULT '[]',  -- [{ name, isHidden, description }]
  evolutions   jsonb NOT NULL DEFAULT '[]',  -- [{ fromId, toId, name, spriteUrl, condition }]
  learnset     jsonb NOT NULL DEFAULT '[]',  -- [{ move, type, category, power, accuracy, pp, method, level }]
  description  text,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pokemon_name ON pokemon (name);
CREATE INDEX idx_pokemon_display_name ON pokemon (lower(display_name));
CREATE INDEX idx_pokemon_dex_number ON pokemon (dex_number);
CREATE INDEX idx_pokemon_types ON pokemon USING GIN (types);
