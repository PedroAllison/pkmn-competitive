import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTeam } from '../api/teams';
import { useAsync } from '../hooks/useAsync';
import { SpriteImg } from '../components/SpriteImg';

/** Detalhe de um time: paste do Showdown (copiável), estratégia e leads. */
export function TeamDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, loading, error } = useAsync(() => getTeam(id), [id]);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return <p>Carregando time…</p>;
  }
  if (error || !data) {
    return (
      <div className="md-card">
        <p style={{ color: 'var(--md-error)' }}>Não foi possível carregar este time: {error}</p>
        <Link to="/teams" className="md-button secondary" style={{ textDecoration: 'none' }}>
          Voltar aos times
        </Link>
      </div>
    );
  }

  const team = data.data;

  async function handleCopy() {
    await navigator.clipboard.writeText(team.showdownPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Link to="/teams" style={{ fontSize: '0.85rem' }}>
        ← Voltar aos times
      </Link>

      <section className="md-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0 }}>{team.name}</h1>
            <p style={{ color: 'var(--md-on-surface-variant)', margin: '4px 0' }}>
              {team.author}
              {team.event ? ` · ${team.event}` : ''}
              {team.placement ? ` · ${team.placement}` : ''}
            </p>
          </div>
          <span className="badge pending">{team.format}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {team.pokemon.map((p) => (
            <div key={p.name} style={{ textAlign: 'center' }}>
              <SpriteImg src={p.spriteUrl} name={p.name} alt={p.displayName} size={48} />
              <div style={{ fontSize: '0.72rem' }}>{p.displayName}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--md-on-surface-variant)' }}>{p.item}</div>
            </div>
          ))}
        </div>
      </section>

      {team.strategy && (
        <section className="md-card">
          <h3 style={{ marginTop: 0 }}>Estratégia</h3>
          <p style={{ color: 'var(--md-on-surface-variant)' }}>{team.strategy}</p>
        </section>
      )}

      {team.leadGuide && (
        <section className="md-card">
          <h3 style={{ marginTop: 0 }}>Leads e posicionamento</h3>
          <p style={{ color: 'var(--md-on-surface-variant)' }}>{team.leadGuide}</p>
        </section>
      )}

      <section className="md-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Importar para o Pokémon Showdown</h3>
          <button type="button" className="md-button" onClick={handleCopy}>
            {copied ? 'Copiado!' : 'Copiar paste'}
          </button>
        </div>
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: 'var(--md-surface)',
            borderRadius: 8,
            fontSize: '0.78rem',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
          }}
        >
          {team.showdownPaste}
        </pre>
        {team.sourceUrl && (
          <a href={team.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem' }}>
            Ver fonte original
          </a>
        )}
      </section>
    </div>
  );
}
