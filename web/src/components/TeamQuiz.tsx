import { useState } from 'react';
import { Link } from 'react-router-dom';
import { listTeams, getTeam, type TeamDetail } from '../api/teams';
import { useFormats } from '../hooks/useFormats';
import { SpriteImg } from '../components/SpriteImg';
import { rankTeams, type QuizAnswers } from '../domain/teamRecommendation';

const DEFAULT_ANSWERS: QuizAnswers = {
  offense: 'any',
  speed: 'any',
  format: 'any',
  weather: 'any',
  mega: 'any',
};

interface Option<T extends string> {
  value: T;
  label: string;
}

function ChoiceRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={opt.value === value ? 'md-button' : 'md-button secondary'}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Quiz de perfil do treinador para recomendar um time do catálogo (ver
 * `domain/teamRecommendation.ts`). Pergunta sobre estilo de jogo, controle de
 * velocidade, formato, clima e preferência por Mega Evolution, pontua os 17
 * times seed e mostra o de melhor match com a explicação de por quê e como
 * jogar (reaproveitando `strategy`/`leadGuide` do time).
 */
export function TeamQuiz() {
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS);
  const [result, setResult] = useState<TeamDetail | null>(null);
  const [alternative, setAlternative] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formats } = useFormats();

  function updateAnswer<K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const listResp = await listTeams({ limit: 50 });
      const ranked = rankTeams(
        listResp.data.map((t) => t.id),
        answers,
      );
      if (ranked.length === 0) {
        setError('Nenhum time cadastrado ainda para recomendar.');
        setResult(null);
        return;
      }
      const [best, second] = ranked;
      const detailResp = await getTeam(best.id);
      setResult(detailResp.data);
      const secondSummary = second ? listResp.data.find((t) => t.id === second.id) : undefined;
      setAlternative(secondSummary ? { id: secondSummary.id, name: secondSummary.name } : null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao calcular recomendação');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setAnswers(DEFAULT_ANSWERS);
    setResult(null);
    setAlternative(null);
    setError(null);
  }

  if (result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section className="md-card">
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--md-on-surface-variant)' }}>
            Recomendado para o seu perfil
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            <h2 style={{ margin: 0 }}>{result.name}</h2>
            <span className="badge pending">
              {formats.find((f) => f.id === result.format)?.label ?? result.format}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {result.pokemon.map((p) => (
              <div key={p.name} style={{ textAlign: 'center' }}>
                <SpriteImg src={p.spriteUrl} name={p.name} alt={p.displayName} size={48} />
                <div style={{ fontSize: '0.72rem' }}>{p.displayName}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--md-on-surface-variant)' }}>{p.item}</div>
              </div>
            ))}
          </div>
        </section>

        {result.strategy && (
          <section className="md-card">
            <h3 style={{ marginTop: 0 }}>Por que esse time</h3>
            <p style={{ color: 'var(--md-on-surface-variant)' }}>{result.strategy}</p>
          </section>
        )}

        {result.leadGuide && (
          <section className="md-card">
            <h3 style={{ marginTop: 0 }}>Como jogar com ele</h3>
            <p style={{ color: 'var(--md-on-surface-variant)' }}>{result.leadGuide}</p>
          </section>
        )}

        <section className="md-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <Link to={`/teams/${encodeURIComponent(result.id)}`} className="md-button secondary" style={{ textDecoration: 'none' }}>
              Ver paste completo do Showdown
            </Link>
            <button type="button" className="md-button secondary" onClick={handleReset}>
              Refazer o quiz
            </button>
          </div>
          {alternative && (
            <p style={{ fontSize: '0.8rem', color: 'var(--md-on-surface-variant)', marginTop: 12, marginBottom: 0 }}>
              Também combina com seu perfil:{' '}
              <Link to={`/teams/${encodeURIComponent(alternative.id)}`}>{alternative.name}</Link>
            </p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="md-card">
      <p style={{ color: 'var(--md-on-surface-variant)', marginTop: 0 }}>
        Responda algumas perguntas sobre como você gosta de jogar e a gente recomenda um time do catálogo,
        explicando por que ele combina com seu perfil e como jogar com ele.
      </p>

      <div style={{ marginBottom: 20 }}>
        <strong>Você se considera um treinador mais ofensivo ou mais controlado?</strong>
        <ChoiceRow
          value={answers.offense}
          onChange={(v) => updateAnswer('offense', v)}
          options={[
            { value: 'offense', label: 'Ofensivo — quero pressionar o tempo todo' },
            { value: 'balance', label: 'Equilibrado' },
            { value: 'defense', label: 'Controlado — prefiro jogar defensivo' },
            { value: 'any', label: 'Tanto faz' },
          ]}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Prefere times rápidos (agir primeiro) ou mais lentos (Trick Room)?</strong>
        <ChoiceRow
          value={answers.speed}
          onChange={(v) => updateAnswer('speed', v)}
          options={[
            { value: 'fast', label: 'Rápido — quero agir primeiro' },
            { value: 'trickroom', label: 'Lento de propósito (Trick Room)' },
            { value: 'balanced', label: 'Meio-termo' },
            { value: 'any', label: 'Tanto faz' },
          ]}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Prefere jogar em duplas (VGC) ou simples (BSS/OU)?</strong>
        <ChoiceRow
          value={answers.format}
          onChange={(v) => updateAnswer('format', v)}
          options={[
            { value: 'doubles', label: 'Duplas (VGC)' },
            { value: 'singles', label: 'Simples (BSS/OU)' },
            { value: 'any', label: 'Tanto faz' },
          ]}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Gosta de jogar em volta de um clima (chuva, sol, areia ou neve)?</strong>
        <ChoiceRow
          value={answers.weather}
          onChange={(v) => updateAnswer('weather', v)}
          options={[
            { value: 'rain', label: 'Chuva' },
            { value: 'sun', label: 'Sol' },
            { value: 'sandsnow', label: 'Areia ou neve' },
            { value: 'none', label: 'Sem clima' },
            { value: 'any', label: 'Tanto faz' },
          ]}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <strong>Quer uma Mega Evolution forte guiando o time?</strong>
        <ChoiceRow
          value={answers.mega}
          onChange={(v) => updateAnswer('mega', v)}
          options={[
            { value: 'yes', label: 'Sim, quero uma Mega de destaque' },
            { value: 'any', label: 'Tanto faz' },
          ]}
        />
      </div>

      {error && <p style={{ color: 'var(--md-error)' }}>{error}</p>}

      <button type="button" className="md-button" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Calculando...' : 'Recomendar um time pra mim'}
      </button>
    </div>
  );
}
