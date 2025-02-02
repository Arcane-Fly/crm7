import { z } from 'zod';

/**
 * Environment variable schema validation
 */
const envSchema = z.object({
  // Auth0 Configuration
  AUTH0_SECRET: z.string(),
  AUTH0_BASE_URL: z.string().url(),
  AUTH0_ISSUER_BASE_URL: z.string().url(),
  AUTH0_CLIENT_ID: z.string(),
  AUTH0_CLIENT_SECRET: z.string(),

  // Database Configuration
  DATABASE_URL: z.string().url(),

  // API Keys
  FAIRWORK_API_KEY: z.string(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  DATADOG_API_KEY: z.string().optional(),
  DATADOG_APP_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_BETA_FEATURES: z.coerce.boolean().default(false: unknown),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100: unknown),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000: unknown),

  // Cache Configuration
  REDIS_URL: z.string().url().optional(),
  CACHE_TTL: z.coerce.number().int().positive().default(3600: unknown),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Security
  CORS_ORIGINS: z.string().transform((str: unknown) => str.split(',')),

  // Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001: unknown),
});

/**
 * Validate and export environment configuration
 */
export const env = envSchema.parse({
  AUTH0_SECRET: process.env.AUTH0_SECRET,
  AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
  AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  FAIRWORK_API_KEY: process.env.FAIRWORK_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN,
  DATADOG_API_KEY: process.env.DATADOG_API_KEY,
  DATADOG_APP_KEY: process.env.DATADOG_APP_KEY,
  ENABLE_BETA_FEATURES: process.env.ENABLE_BETA_FEATURES === 'true',
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX),
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS),
  REDIS_URL: process.env.REDIS_URL,
  CACHE_TTL: Number(process.env.CACHE_TTL),
  LOG_LEVEL: process.env.LOG_LEVEL as any,
  CORS_ORIGINS: process.env.CORS_ORIGINS ?? '',
  NODE_ENV: process.env.NODE_ENV as any,
  PORT: Number(process.env.PORT),
});
