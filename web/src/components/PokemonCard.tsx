import { Link } from 'react-router-dom';
import type { PokemonSummary } from '../api/types';
import { TypeBadge } from './TypeBadge';
import { SpriteImg } from './SpriteImg';

/** Card de Pokémon usado na Pokédex (grid de busca/listagem). */
export function PokemonCard({ pokemon }: { pokemon: PokemonSummary }) {
  return (
    <Link
      to={`/pokemon/${encodeURIComponent(pokemon.name)}`}
      className="md-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        textDecoration: 'none',
        color: 'var(--md-on-surface)',
        textAlign: 'center',
      }}
    >
      {pokemon.usageRank && (
        <span className="badge pending" style={{ alignSelf: 'flex-end' }}>
          #{pokemon.usageRank}
        </span>
      )}
      <SpriteImg
        src={pokemon.spriteUrl}
        name={pokemon.name}
        alt={pokemon.displayName}
        size={72}
        style={{ imageRendering: 'pixelated' }}
        loading="lazy"
      />
      <strong style={{ fontSize: '0.9rem' }}>{pokemon.displayName}</strong>
      <span style={{ fontSize: '0.72rem', color: 'var(--md-on-surface-variant)' }}>
        Nº {pokemon.dexNumber}
      </span>
      <div style={{ display: 'flex', gap: 4 }}>
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
      {pokemon.usagePct !== null && (
        <span style={{ fontSize: '0.75rem', color: 'var(--md-on-surface-variant)' }}>
          {pokemon.usagePct.toFixed(1)}% de uso
        </span>
      )}
    </Link>
  );
}
