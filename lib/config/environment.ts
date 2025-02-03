import { z } from 'zod';

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  // Auth
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  AUTH_CLIENT_ID: z.string(),
  AUTH_CLIENT_SECRET: z.string(),

  // Features
  ENABLE_BETA_FEATURES: z.coerce.boolean().default(false),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().int().positive(),

  // Cache
  CACHE_TTL: z.coerce.number().int().positive().default(3600),

  // External Services
  FAIRWORK_API_URL: z.string().url(),
  FAIRWORK_API_KEY: z.string(),

  // Server
  HOST: z.string().default('localhost'),
  PORT: z.coerce.number().int().positive().default(3001),
});

export const env = envSchema.parse(process.env);
