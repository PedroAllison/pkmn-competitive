import type { CSSProperties } from 'react';

/** Sprite genérico (Pokébola) usado quando nem a forma base tem imagem disponível. */
const PLACEHOLDER_SPRITE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#3a3d34" stroke="#6b6f5f" stroke-width="2"/><path d="M2 24h20a2 2 0 0 0 4 0h20" fill="none" stroke="#6b6f5f" stroke-width="2"/><circle cx="24" cy="24" r="6" fill="#3a3d34" stroke="#6b6f5f" stroke-width="2"/></svg>',
  );

export interface SpriteImgProps {
  /** URL de sprite recebida da API (pode ser do banco/PokéAPI ou fallback do Showdown). */
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
 * `<img>` com fallback em cascata para sprites: tenta o `src` recebido (forma
 * exata, ex.: mega) e, se falhar, tenta a forma base (ex.: "pyroar-mega" →
 * "pyroar") no Showdown antes de cair no placeholder genérico. Usado em
 * qualquer lugar que renderiza sprite de Pokémon a partir da API — algumas
 * formas (mega/alt exclusivas do Champions, sem equivalente no jogo
 * principal) não têm sprite real em lugar nenhum, então a forma base é a
 * imagem "mais parecida" disponível.
 */
export function SpriteImg({ src, name, alt, size, className, style, loading }: SpriteImgProps) {
  const baseName = name.replace(/-mega(-[xy])?$|-gmax$|-primal$/i, '');
  const baseSrc = `https://play.pokemonshowdown.com/sprites/dex/${baseName}.png`;
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={style}
      loading={loading}
      onError={(e) => {
        const img = e.currentTarget;
        const stage = img.dataset.fallbackStage ?? '0';
        if (stage === '0' && baseName !== name) {
          img.dataset.fallbackStage = '1';
          img.src = baseSrc;
        } else if (stage !== '2') {
          img.dataset.fallbackStage = '2';
          img.src = PLACEHOLDER_SPRITE;
        }
      }}
    />
  );
}
