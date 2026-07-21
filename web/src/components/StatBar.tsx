const MAX_STAT = 255;

/** Barra horizontal para um base stat (0–255), estilo Pokédex. */
export function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.round((value / MAX_STAT) * 100));
  const color = value >= 120 ? 'var(--md-success)' : value >= 80 ? 'var(--md-primary)' : 'var(--md-warning)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
      <span style={{ width: 36, color: 'var(--md-on-surface-variant)' }}>{label}</span>
      <span style={{ width: 28, textAlign: 'right', fontWeight: 600 }}>{value}</span>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 100,
          background: 'var(--md-surface)',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
    </div>
  );
}
