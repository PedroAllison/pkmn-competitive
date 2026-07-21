import 'dotenv/config';
import { z } from 'zod';

/**
 * Configuração tipada do ambiente. Defaults permitem subir em dev/test sem
 * `.env` (Redis é opcional — sem REDIS_URL o cache vira no-op).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string()
    .default('postgres://postgres:postgres@localhost:5432/pokecompanion'),
  REDIS_URL: z.string().optional(),
  ADMIN_API_KEY: z.string().default('dev-admin-key'),
  SMOGON_BASELINE: z.coerce.number().int().default(1760),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
