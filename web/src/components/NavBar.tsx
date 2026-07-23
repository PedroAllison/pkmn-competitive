import { NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

// Enquanto a Home "de verdade" (busca, metagame, notícias) não é construída,
// a rota raiz aponta para o diagnóstico do sistema — é a tela mais útil
// agora para validar que o site fala com o backend.
const links = [
  { to: '/', label: 'Diagnóstico' },
  { to: '/pokemon', label: 'Pokédex' },
  { to: '/teams', label: 'Times' },
  { to: '/builder', label: 'Team Builder' },
  { to: '/tools', label: 'Ferramentas' },
];

/** Barra de navegação superior do site (MD3, com alternância de tema). */
export function NavBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        rowGap: 8,
        columnGap: 16,
        padding: '14px clamp(16px, 4vw, 48px)',
        borderBottom: '1px solid var(--md-outline)',
        position: 'sticky',
        top: 0,
        background: 'var(--md-surface)',
        zIndex: 10,
      }}
    >
      <strong style={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}>Lab Pokémon</strong>
      <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              padding: '8px 14px',
              borderRadius: 100,
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              color: isActive
                ? 'var(--md-on-primary-container)'
                : 'var(--md-on-surface-variant)',
              background: isActive ? 'var(--md-primary-container)' : 'transparent',
            })}
            end={link.to === '/'}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        className="md-button secondary"
        onClick={toggleTheme}
        aria-label="Alternar tema"
      >
        {theme === 'light' ? '🌙 Escuro' : '☀️ Claro'}
      </button>
    </header>
  );
}
