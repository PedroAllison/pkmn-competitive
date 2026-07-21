import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Testes não dependem de Postgres/Redis reais: rotas usam mocks de service
    // e o cache vira no-op quando REDIS_URL não está definido.
  },
});
