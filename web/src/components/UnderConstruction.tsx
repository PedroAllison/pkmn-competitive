import { Link } from 'react-router-dom';

/** Placeholder padrão para páginas ainda não implementadas. */
export function UnderConstruction({ title, message }: { title: string; message: string }) {
  return (
    <div className="md-card" style={{ textAlign: 'center', padding: 48 }}>
      <h1>{title}</h1>
      <p style={{ color: 'var(--md-on-surface-variant)' }}>{message}</p>
      <Link to="/" className="md-button secondary" style={{ textDecoration: 'none' }}>
        Ir para o diagnóstico do sistema
      </Link>
    </div>
  );
}
