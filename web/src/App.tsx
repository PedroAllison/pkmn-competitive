import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { SystemCheckPage } from './pages/SystemCheckPage';
import { PokemonPage } from './pages/PokemonPage';
import { PokemonDetailPage } from './pages/PokemonDetailPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { BuilderPage } from './pages/BuilderPage';
import { ToolsPage } from './pages/ToolsPage';

/**
 * Casca do site: navegação + roteamento de páginas.
 *
 * A rota raiz (`/`) é temporariamente o diagnóstico do sistema
 * (`SystemCheckPage`) até a Home real (busca, metagame, notícias) ser
 * implementada — ver `docs/ARCHITECTURE.md`.
 */
export function App() {
  return (
    <div className="app-shell" style={{ flexDirection: 'column', width: '100%' }}>
      <NavBar />
      <main className="app-content">
        <Routes>
          <Route path="/" element={<SystemCheckPage />} />
          <Route path="/pokemon" element={<PokemonPage />} />
          <Route path="/pokemon/:name" element={<PokemonDetailPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/builder" element={<BuilderPage />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </main>
    </div>
  );
}
