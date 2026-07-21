import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuração do Vite. `VITE_API_BASE_URL` (ver `.env.example`) define a
 * base da API consumida pelo cliente HTTP em `src/api/client.ts`.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
