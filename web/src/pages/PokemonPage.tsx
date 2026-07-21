import { useEffect, useState } from 'react';
import { listPokemon } from '../api/pokemon';
import { useAsync } from '../hooks/useAsync';
import { useFormats } from '../hooks/useFormats';
import { PokemonCard } from '../components/PokemonCard';
import { FormatSelect } from '../components/FormatSelect';

/** Usa um debounce simples para não disparar uma requisição a cada tecla. */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/**
 * Pokédex do Pokémon Champions: busca por nome, filtro por formato
 * (regulation), grid de resultados. Só mostra Pokémon com uso real
 * registrado — nunca a Pokédex completa misturada com espécies fora do
 * metagame atual.
 */
export function PokemonPage() {
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const { formats } = useFormats();

  const { data, loading, error } = useAsync(
    () =>
      listPokemon({
        search: debouncedSearch || undefined,
        format: format || undefined,
        game: format ? undefined : 'champions',
        limit: 40,
      }),
    [debouncedSearch, format],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <section>
        <h1 style={{ marginBottom: 4 }}>Pokédex — Pokémon Champions</h1>
        <p style={{ color: 'var(--md-on-surface-variant)' }}>
          Escolha o formato (ou veja todos) para ver o % de uso no metagame atual.
        </p>
      </section>

      <section className="md-card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          className="md-input"
          style={{ flex: 1, minWidth: 220 }}
          placeholder="Buscar Pokémon (ex.: Gholdengo)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FormatSelect formats={formats} format={format} onFormatChange={setFormat} includeAllOption />
      </section>

      {loading && <p>Carregando…</p>}
      {error && (
        <p style={{ color: 'var(--md-error)' }}>
          Não foi possível carregar a Pokédex: {error}
        </p>
      )}
      {!loading && !error && data && data.data.length === 0 && (
        <div className="md-card">
          <p style={{ margin: 0 }}>
            Nenhum Pokémon encontrado para este formato. Se o banco ainda não foi populado, rode{' '}
            <code>POST /sync/run?job=pokedex</code> no backend (veja o Diagnóstico do sistema).
          </p>
        </div>
      )}
      {!loading && !error && data && data.data.length > 0 && (
        <section
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          }}
        >
          {data.data.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </section>
      )}
    </div>
  );
}
