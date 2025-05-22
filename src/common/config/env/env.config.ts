import { z } from 'zod';

export const envSchema = z.object({
  // APP
  NODE_ENV: z.string().default('development'),
  PORT: z.string().default('3000'),
  BASE_URL: z.string(),

  // DATABASE
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRATION_TIME: z.string().default('1d'),

  // EMAIL (MailHog)
  MAILHOG_HOST: z.string(),
  MAILHOG_PORT: z.coerce.number(),
  EMAIL_DEFAULT_FROM: z.string().email().default('noreply@example.com'),

  // REDIS (Queue)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  // INTEGRATION
  DEEPL_API_KEY: z.string(),
  ANONYMIZER_URL: z.string(),
  ANONYMIZER_TIMEOUT: z.coerce.number(),
});
export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): Env {
  try {
    return envSchema.parse(env);
  } catch (e) {
    throw new Error(`.env configuration validation error: ${e}`);
  }
}
