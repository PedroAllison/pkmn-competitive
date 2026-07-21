import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listTeams } from '../api/teams';
import { useAsync } from '../hooks/useAsync';
import { useFormats } from '../hooks/useFormats';
import { FormatSelect } from '../components/FormatSelect';
import { SpriteImg } from '../components/SpriteImg';

/** Lista de times campeões/de referência do Pokémon Champions, filtrável por formato. */
export function TeamsPage() {
  const [format, setFormat] = useState('');
  const { formats } = useFormats();

  const { data, loading, error } = useAsync(
    () => listTeams({ format: format || undefined, limit: 50 }),
    [format],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section>
        <h1 style={{ marginBottom: 4 }}>Times</h1>
        <p style={{ color: 'var(--md-on-surface-variant)' }}>
          Times campeões e de referência, prontos para importar no Pokémon Showdown.
        </p>
      </section>

      <section className="md-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <FormatSelect formats={formats} format={format} onFormatChange={setFormat} includeAllOption />
      </section>

      {loading && <p>Carregando…</p>}
      {error && <p style={{ color: 'var(--md-error)' }}>Não foi possível carregar os times: {error}</p>}

      {!loading && !error && data && data.data.length === 0 && (
        <div className="md-card">
          <p style={{ margin: 0 }}>Nenhum time cadastrado para este formato ainda.</p>
        </div>
      )}

      {!loading && !error && data && data.data.length > 0 && (
        <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {data.data.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${encodeURIComponent(team.id)}`}
              className="md-card"
              style={{ textDecoration: 'none', color: 'var(--md-on-surface)' }}
            >
              <strong>{team.name}</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)', margin: '4px 0 8px' }}>
                {team.author}
                {team.event ? ` · ${team.event}` : ''}
                {team.placement ? ` · ${team.placement}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {team.pokemon.map((p) => (
                  <span key={p.name} title={p.displayName}>
                    <SpriteImg src={p.spriteUrl} name={p.name} alt={p.displayName} size={32} />
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
