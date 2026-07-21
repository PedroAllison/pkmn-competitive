import { typeColor } from '../styles/typeColors';

/** Badge colorido de tipo de Pokémon (ex.: "fire", "water"). */
export function TypeBadge({ type }: { type: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 100,
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: '#fff',
        background: typeColor(type),
      }}
    >
      {type}
    </span>
  );
}
