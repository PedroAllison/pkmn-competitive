/** Utilitários de normalização de nomes/números usados em todo o backend. */

/** Arredonda para `d` casas decimais (default 2). */
export function round(n: number, d = 2): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

/**
 * Normaliza um nome para o "id" estilo Showdown: minúsculas, só [a-z0-9].
 * Ex.: "Choice Band" → "choiceband", "Urshifu-Rapid-Strike" → "urshifurapidstrike".
 */
export function toShowdownId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Converte um nome de exibição do Smogon ("Great Tusk", "Ogerpon-Wellspring")
 * para o slug canônico usado na coluna `pokemon.name` (estilo PokéAPI).
 */
export function toCanonicalName(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[.'’%:]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** "great-tusk" → "Great Tusk". */
export function toDisplayName(slug: string): string {
  return slug
    .split(/[-\s]+/)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ');
}

/**
 * Sprite estático de fallback do Showdown (usado quando o Pokémon ainda não
 * está no banco — ex.: teammates/checks de usage stats).
 *
 * Usa `/sprites/dex/` (não `/sprites/gen5/`): a pasta gen5 é anterior à Mega
 * Evolution e não tem nenhuma forma alternativa. `/sprites/dex/` cobre megas,
 * regionais e demais formas (ex.: `charizard-mega-y.png`, `pyroar-mega.png`),
 * então o slug precisa manter o traço da forma — por isso usa
 * `toCanonicalName` (preserva `-`) em vez de `toShowdownId` (que remove tudo
 * que não for [a-z0-9] e colapsava "pyroar-mega" em "pyroarmega", um arquivo
 * inexistente).
 */
export function showdownSpriteUrl(name: string): string {
  return `https://play.pokemonshowdown.com/sprites/dex/${toCanonicalName(name)}.png`;
}
