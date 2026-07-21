import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCompetitiveData, getPokemonDetail } from '../api/pokemon';
import { useAsync } from '../hooks/useAsync';
import { useFormats } from '../hooks/useFormats';
import { TypeBadge } from '../components/TypeBadge';
import { StatBar } from '../components/StatBar';
import { FormatSelect } from '../components/FormatSelect';
import { SpriteImg } from '../components/SpriteImg';

const difficultyLabel: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

/** Página de detalhe de um Pokémon: ficha + dados competitivos por formato (Pokémon Champions). */
export function PokemonDetailPage() {
  const { name = '' } = useParams<{ name: string }>();
  const [format, setFormat] = useState('gen9championsvgc2026regmb');
  const { formats } = useFormats();

  const detailState = useAsync(() => getPokemonDetail(name), [name]);
  const competitiveState = useAsync(
    () => (format ? getCompetitiveData(name, format) : Promise.resolve(null)),
    [name, format],
  );

  if (detailState.loading) {
    return <p>Carregando ficha do Pokémon…</p>;
  }
  if (detailState.error || !detailState.data) {
    return (
      <div className="md-card">
        <p style={{ color: 'var(--md-error)' }}>
          Não foi possível carregar este Pokémon: {detailState.error}
        </p>
        <Link to="/pokemon" className="md-button secondary" style={{ textDecoration: 'none' }}>
          Voltar à Pokédex
        </Link>
      </div>
    );
  }

  const pokemon = detailState.data.data;
  const competitive = competitiveState.data?.data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Link to="/pokemon" style={{ fontSize: '0.85rem' }}>
        ← Voltar à Pokédex
      </Link>

      <section className="md-card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <SpriteImg
          src={pokemon.artworkUrl || pokemon.spriteUrl}
          name={pokemon.name}
          alt={pokemon.displayName}
          size={160}
        />
        <div style={{ flex: 1, minWidth: 220 }}>
          <span style={{ color: 'var(--md-on-surface-variant)' }}>Nº {pokemon.dexNumber}</span>
          <h1 style={{ margin: '4px 0' }}>{pokemon.displayName}</h1>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <p style={{ color: 'var(--md-on-surface-variant)', maxWidth: 560 }}>{pokemon.description}</p>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', marginTop: 8 }}>
            <span>Altura: {(pokemon.height / 10).toFixed(1)}m</span>
            <span>Peso: {(pokemon.weight / 10).toFixed(1)}kg</span>
          </div>
        </div>
        <div style={{ minWidth: 240, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <strong style={{ fontSize: '0.85rem' }}>Base Stats</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              <StatBar label="HP" value={pokemon.baseStats.hp} />
              <StatBar label="Atk" value={pokemon.baseStats.atk} />
              <StatBar label="Def" value={pokemon.baseStats.def} />
              <StatBar label="SpA" value={pokemon.baseStats.spa} />
              <StatBar label="SpD" value={pokemon.baseStats.spd} />
              <StatBar label="Spe" value={pokemon.baseStats.spe} />
            </div>
          </div>
          <div>
            <strong style={{ fontSize: '0.85rem' }}>Habilidades</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
              {pokemon.abilities.map((a) => (
                <div key={a.name}>
                  <span style={{ fontWeight: 600 }}>{a.name}</span>
                  {a.isHidden && <span className="badge pending" style={{ marginLeft: 8 }}>Oculta</span>}
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
                    {a.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="md-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ margin: 0 }}>Dados competitivos</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <FormatSelect formats={formats} format={format} onFormatChange={setFormat} />
          </div>
        </div>

        {!format && (
          <p style={{ color: 'var(--md-on-surface-variant)' }}>
            Nenhum formato competitivo cadastrado ainda.
          </p>
        )}
        {format && competitiveState.loading && <p>Carregando dados de uso…</p>}
        {format && competitiveState.error && (
          <p style={{ color: 'var(--md-error)' }}>
            Sem dados competitivos para este formato ainda: {competitiveState.error}
          </p>
        )}
        {competitive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span className="badge ok">
                #{competitive.usageRank} · {competitive.usagePct.toFixed(1)}% de uso
              </span>
              <span className="badge pending">
                Dificuldade: {difficultyLabel[competitive.difficulty] ?? competitive.difficulty}
              </span>
              <span className="badge pending">Mês: {competitive.month}</span>
            </div>

            {competitive.strategyText && (
              <p style={{ color: 'var(--md-on-surface-variant)' }}>{competitive.strategyText}</p>
            )}

            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <NamedPctList title="Itens" items={competitive.items} />
              <NamedPctList title="Natures" items={competitive.natures} />
              <NamedPctList title="Tera Types" items={competitive.teraTypes} />
              <NamedPctList title="Moves" items={competitive.moves} />
            </div>

            {competitive.teammates.length > 0 && (
              <div>
                <strong>Parceiros frequentes</strong>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  {competitive.teammates.map((t) => (
                    <Link
                      key={t.name}
                      to={`/pokemon/${encodeURIComponent(t.name)}`}
                      style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
                    >
                      <SpriteImg src={t.spriteUrl} name={t.name} alt={t.displayName} size={48} />
                      <div style={{ fontSize: '0.75rem' }}>{t.displayName}</div>
                      {t.item && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--md-on-surface-variant)' }}>
                          @ {t.item}
                        </div>
                      )}
                      <div style={{ fontSize: '0.7rem', color: 'var(--md-on-surface-variant)' }}>
                        {t.pct.toFixed(1)}%
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {competitive.checksAndCounters.length > 0 && (
              <div>
                <strong>Checks &amp; counters</strong>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                  {competitive.checksAndCounters.map((c) => (
                    <Link
                      key={c.name}
                      to={`/pokemon/${encodeURIComponent(c.name)}`}
                      style={{ textAlign: 'center', textDecoration: 'none', color: 'inherit' }}
                    >
                      <SpriteImg src={c.spriteUrl} name={c.name} alt={c.displayName} size={48} />
                      <div style={{ fontSize: '0.75rem' }}>{c.displayName}</div>
                      {c.item && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--md-on-surface-variant)' }}>
                          @ {c.item}
                        </div>
                      )}
                      <span className={`badge ${c.kind === 'counter' ? 'ok' : 'warning'}`}>
                        {c.kind === 'counter' ? 'Counter' : 'Check'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="md-card">
        <h3 style={{ marginTop: 0 }}>Learnset ({pokemon.learnset.length} moves)</h3>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--md-on-surface-variant)' }}>
                <th>Move</th>
                <th>Tipo</th>
                <th>Cat.</th>
                <th>Poder</th>
                <th>Precisão</th>
              </tr>
            </thead>
            <tbody>
              {pokemon.learnset.map((move) => (
                <tr key={`${move.move}-${move.method}-${move.level ?? ''}`}>
                  <td>{move.move}</td>
                  <td>
                    <TypeBadge type={move.type} />
                  </td>
                  <td>{move.category}</td>
                  <td>{move.power ?? '—'}</td>
                  <td>{move.accuracy ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function NamedPctList({ title, items }: { title: string; items: { name: string; pct: number }[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div>
      <strong style={{ fontSize: '0.85rem' }}>{title}</strong>
      <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', fontSize: '0.8rem' }}>
        {items.slice(0, 6).map((item) => (
          <li key={item.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>{item.name}</span>
            <span style={{ color: 'var(--md-on-surface-variant)' }}>{item.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
