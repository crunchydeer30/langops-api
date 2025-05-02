import { z } from 'zod';

export const envSchema = z.object({
  // APP
  NODE_ENV: z.string().default('development'),
  PORT: z.string().default('3000'),

  // DATABASE
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string().default('1d'),
});
export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  try {
    return envSchema.parse(env);
  } catch (e) {
    throw new Error(`.env configuration validation error: ${e}`);
  }
}
