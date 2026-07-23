import { useMemo, useState } from 'react';
import { listPokemon } from '../api/pokemon';
import { useAsync } from '../hooks/useAsync';
import type { PokemonSummary } from '../api/types';
import { TypeBadge } from '../components/TypeBadge';
import { SpriteImg } from '../components/SpriteImg';
import { TeamQuiz } from '../components/TeamQuiz';
import { CHART_TYPES, defensiveMultiplier, offensiveCoverage } from '../domain/typeChart';
import { analyzeTeam } from '../domain/teamAnalysis';

const MAX_TEAM_SIZE = 6;
type BuilderMode = 'manual' | 'quiz';

/**
 * Team Builder (MVP): adicionar até 6 Pokémon por busca, ver cobertura
 * ofensiva (STAB) e o perfil defensivo agregado do time (quantos membros
 * são fracos/resistentes/imunes a cada tipo de ataque).
 *
 * Não valida clauses completas do formato (ex.: Species Clase, itens
 * banidos) — isso fica para uma próxima iteração; aqui o objetivo é dar
 * uma primeira visão de sinergia de tipos.
 */
export function BuilderPage() {
  const [mode, setMode] = useState<BuilderMode>('manual');
  const [team, setTeam] = useState<PokemonSummary[]>([]);
  const [search, setSearch] = useState('');

  const { data: searchResults, loading } = useAsync(
    // `game: 'champions'` restringe a busca ao roster atual do Champions —
    // sem isso, o backend cai no fetch-on-miss da PokéAPI e traz qualquer
    // Pokémon da Dex nacional, incluindo espécies que não existem no jogo.
    () =>
      search.trim()
        ? listPokemon({ search: search.trim(), game: 'champions', limit: 8 })
        : Promise.resolve(null),
    [search],
  );

  function addPokemon(pokemon: PokemonSummary) {
    if (team.length >= MAX_TEAM_SIZE || team.some((p) => p.id === pokemon.id)) {
      return;
    }
    setTeam((prev) => [...prev, pokemon]);
    setSearch('');
  }

  function removePokemon(id: number) {
    setTeam((prev) => prev.filter((p) => p.id !== id));
  }

  const stabTypes = useMemo(
    () => Array.from(new Set(team.flatMap((p) => p.types.map((t) => t.toLowerCase())))),
    [team],
  );
  const covered = useMemo(() => offensiveCoverage(stabTypes), [stabTypes]);
  const uncovered = CHART_TYPES.filter((t) => !covered.includes(t));

  const defensiveCounts = useMemo(() => {
    const counts: Record<string, { weak: number; resist: number; immune: number }> = {};
    for (const attacking of CHART_TYPES) {
      counts[attacking] = { weak: 0, resist: 0, immune: 0 };
      for (const p of team) {
        const mult = defensiveMultiplier(attacking, p.types);
        if (mult === 0) counts[attacking].immune += 1;
        else if (mult >= 2) counts[attacking].weak += 1;
        else if (mult < 1) counts[attacking].resist += 1;
      }
    }
    return counts;
  }, [team]);

  const sortedBySpeed = useMemo(
    () => [...team].sort((a, b) => b.baseStats.spe - a.baseStats.spe),
    [team],
  );

  const analysis = useMemo(
    () => analyzeTeam(team, covered, uncovered, defensiveCounts),
    [team, covered, uncovered, defensiveCounts],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section>
        <h1 style={{ marginBottom: 4 }}>Team Builder</h1>
        <p style={{ color: 'var(--md-on-surface-variant)' }}>
          Monte um time (até {MAX_TEAM_SIZE} Pokémon) e veja cobertura ofensiva e sinergia defensiva
          em tempo real, ou responda um quiz rápido pra gente recomendar um time pronto do catálogo.
        </p>
      </section>

      <section style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className={mode === 'manual' ? 'md-button' : 'md-button secondary'}
          onClick={() => setMode('manual')}
        >
          Montar manualmente
        </button>
        <button
          type="button"
          className={mode === 'quiz' ? 'md-button' : 'md-button secondary'}
          onClick={() => setMode('quiz')}
        >
          Recomendar um time pra mim
        </button>
      </section>

      {mode === 'quiz' && <TeamQuiz />}

      {mode === 'manual' && (
        <>
      <section className="md-card">
        <input
          className="md-input"
          style={{ width: '100%' }}
          placeholder={
            team.length >= MAX_TEAM_SIZE ? 'Time completo (6/6)' : 'Buscar Pokémon para adicionar...'
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={team.length >= MAX_TEAM_SIZE}
        />
        {loading && <p style={{ fontSize: '0.8rem' }}>Buscando…</p>}
        {searchResults && searchResults.data.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {searchResults.data.map((p) => (
              <button
                key={p.id}
                type="button"
                className="md-button secondary"
                onClick={() => addPokemon(p)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <SpriteImg src={p.spriteUrl} name={p.name} alt={p.displayName} size={24} />
                {p.displayName}
              </button>
            ))}
          </div>
        )}
      </section>

      <section
        style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
      >
        {team.map((p) => (
          <div key={p.id} className="md-card" style={{ textAlign: 'center', position: 'relative' }}>
            <button
              type="button"
              onClick={() => removePokemon(p.id)}
              aria-label={`Remover ${p.displayName}`}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                border: 'none',
                background: 'transparent',
                color: 'var(--md-error)',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
            <SpriteImg src={p.spriteUrl} name={p.name} alt={p.displayName} size={64} />
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.displayName}</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
              {p.types.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          </div>
        ))}
        {team.length === 0 && (
          <p style={{ color: 'var(--md-on-surface-variant)' }}>
            Nenhum Pokémon adicionado ainda — busque acima para começar.
          </p>
        )}
      </section>

      {team.length > 0 && (
        <>
          <section className="md-card">
            <h3 style={{ marginTop: 0 }}>Cobertura ofensiva (STAB do time)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
              Tipos que o time acerta com dano super efetivo usando apenas os próprios tipos como STAB.
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {covered.map((t) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
            {uncovered.length > 0 && (
              <>
                <strong style={{ fontSize: '0.8rem' }}>Sem cobertura:</strong>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {uncovered.map((t) => (
                    <span key={t} className="badge pending">
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="md-card">
            <h3 style={{ marginTop: 0 }}>Sinergia defensiva do time</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
              Quantos membros do time são fracos, resistem ou são imunes a cada tipo de ataque.
            </p>
            <div
              style={{
                display: 'grid',
                gap: '2px 16px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              }}
            >
              {CHART_TYPES.map((t) => {
                const c = defensiveCounts[t];
                return (
                  <div
                    key={t}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: '0.78rem',
                      minHeight: 36,
                      padding: '4px 0',
                      borderBottom: '1px solid var(--md-outline)',
                    }}
                  >
                    <TypeBadge type={t} />
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {c.weak > 0 && <span className="badge error">{c.weak} fraco</span>}
                      {c.resist > 0 && <span className="badge ok">{c.resist} resiste</span>}
                      {c.immune > 0 && <span className="badge pending">{c.immune} imune</span>}
                      {c.weak === 0 && c.resist === 0 && c.immune === 0 && (
                        <span style={{ color: 'var(--md-on-surface-variant)' }}>neutro</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="md-card">
            <h3 style={{ marginTop: 0 }}>Speed tiers (base speed)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
              Ordenado pelo base speed — use as Ferramentas (Speed Calculator) para o valor final com
              EVs/nature/item.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {sortedBySpeed.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>{p.displayName}</span>
                  <strong>{p.baseStats.spe}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="md-card">
            <h3 style={{ marginTop: 0 }}>Análise do time</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
              Estimativa a partir de tipo e base stats (sem moveset/item escolhidos ainda) — dá um norte
              de função e de como jogar, mas não substitui um set real como os dos Times prontos.
            </p>
            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                marginTop: 12,
              }}
            >
              {analysis.perPokemon.map(({ pokemon, role, blurb }) => (
                <div key={pokemon.id} style={{ display: 'flex', gap: 10 }}>
                  <SpriteImg src={pokemon.spriteUrl} name={pokemon.name} alt={pokemon.displayName} size={40} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{pokemon.displayName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--md-primary)', fontWeight: 600, marginBottom: 2 }}>
                      {role}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--md-on-surface-variant)', margin: 0 }}>{blurb}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--md-outline)', marginTop: 16, paddingTop: 16 }}>
              <strong style={{ fontSize: '0.85rem' }}>Arquétipo: {analysis.archetype}</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--md-on-surface-variant)', marginBottom: 0 }}>
                {analysis.battlePlan}
              </p>
            </div>
          </section>
        </>
      )}
        </>
      )}
    </div>
  );
}
