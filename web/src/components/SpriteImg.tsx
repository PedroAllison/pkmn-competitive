import type { CSSProperties } from 'react';

/** Sprite genérico (Pokébola) usado quando nenhuma fonte tem imagem disponível. */
const PLACEHOLDER_SPRITE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#3a3d34" stroke="#6b6f5f" stroke-width="2"/><path d="M2 24h20a2 2 0 0 0 4 0h20" fill="none" stroke="#6b6f5f" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="#3a3d34" stroke="#6b6f5f" stroke-width="2"/></svg>',
  );

/**
 * Overrides pontuais onde o slug canônico usado no banco (baseado no nome de
 * exibição do Smogon, ex.: "Floette-Mega") não bate com o slug interno do
 * Pikalytics (que às vezes é mais específico, ex.: "floette_eternal_mega").
 */
const PIKALYTICS_SLUG_ALIASES: Record<string, string> = {
  'floette-mega': 'floette_eternal_mega',
  floette: 'floette_eternal',
  'kommo-o': 'kommoo',
};

/**
 * "charizard-mega-y" → "charizard_megay" (o Pikalytics junta o sufixo
 * X/Y direto em "mega", sem underscore no meio — todo o resto do slug vira
 * underscore puro, ex.: "ninetales-alola" → "ninetales_alola").
 */
function toPikalyticsSlug(name: string): string {
  const base = PIKALYTICS_SLUG_ALIASES[name] ?? name;
  return base.replace(/-/g, '_').replace(/_mega_(x|y)$/, '_mega$1');
}

function pikalyticsSpriteUrl(name: string): string {
  return `https://cdn.pikalytics.com/images/championssprites/${toPikalyticsSlug(name)}.png`;
}

export interface SpriteImgProps {
  /** URL de sprite recebida da API (do banco/PokéAPI) — usada como fallback. */
  src: string;
  /** Slug canônico do Pokémon (ex.: "pyroar-mega", "charizard-mega-y"). */
  name: string;
  alt: string;
  size: number;
  className?: string;
  style?: CSSProperties;
  loading?: 'lazy' | 'eager';
}

/**
 * `<img>` com fallback em cascata para sprites, priorizando o CDN de sprites
 * do próprio Pokémon Champions usado pelo pikalytics.com
 * (`cdn.pikalytics.com/images/championssprites/`) — cobre inclusive Megas
 * exclusivas do Champions sem equivalente no jogo principal (ex.:
 * Pyroar-Mega, Staraptor-Mega), que não existem em nenhum outro CDN público.
 *
 * Ordem de tentativa: (1) sprite exato no Pikalytics, (2) sprite da forma
 * base no Pikalytics (ex.: "pyroar-mega" → "pyroar", caso a forma exata não
 * exista lá), (3) `src` vindo da API (PokéAPI/Showdown), (4) placeholder
 * genérico.
 */
export function SpriteImg({ src, name, alt, size, className, style, loading }: SpriteImgProps) {
  const baseName = name.replace(/-mega(-[xy])?$|-gmax$|-primal$/i, '');

  const candidates = [
    pikalyticsSpriteUrl(name),
    ...(baseName !== name ? [pikalyticsSpriteUrl(baseName)] : []),
    ...(src ? [src] : []),
    PLACEHOLDER_SPRITE,
  ];

  return (
    <img
      src={candidates[0]}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={style}
      loading={loading}
      onError={(e) => {
        const img = e.currentTarget;
        const idx = Number(img.dataset.fallbackIdx ?? '0') + 1;
        if (idx < candidates.length) {
          img.dataset.fallbackIdx = String(idx);
          img.src = candidates[idx];
        }
      }}
    />
  );
}
