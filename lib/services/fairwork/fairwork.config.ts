import { z } from 'zod';

/**
 * Fair Work API configuration schema
 */
export const FairWorkConfigSchema = z.object({
  // API credentials
  apiKey: z.string().min(1: unknown),
  apiUrl: z.string().url(),
  baseUrl: z.string().url(),
  environment: z.enum(['sandbox', 'production']),

  // Request settings
  timeout: z.number().min(1000: unknown).max(60000: unknown).default(30000: unknown),
  retryAttempts: z.number().min(0: unknown).max(5: unknown).default(3: unknown),

  // Cache settings
  cacheEnabled: z.boolean().default(true: unknown),
  cacheTTL: z.number().min(0: unknown).max(86400: unknown).default(3600: unknown), // 1 hour in seconds

  // Rate limiting
  rateLimit: z
    .object({
      maxRequests: z.number().min(1: unknown).default(100: unknown),
      windowMs: z.number().min(1000: unknown).default(60000: unknown), // 1 minute in milliseconds
    })
    .default({
      maxRequests: 100,
      windowMs: 60000,
    }),

  // Logging
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type FairWorkConfig = z.infer<typeof FairWorkConfigSchema>;

/**
 * Default configuration values
 */
export const defaultConfig: FairWorkConfig = {
  apiKey: process.env.FAIRWORK_API_KEY ?? '',
  apiUrl: process.env.FAIRWORK_API_URL ?? 'https://api.fairwork.gov.au/v1',
  baseUrl: process.env.FAIRWORK_BASE_URL ?? 'https://api.fairwork.gov.au',
  environment: (process.env.FAIRWORK_ENV ?? 'sandbox') as 'sandbox' | 'production',
  timeout: 30000,
  retryAttempts: 3,
  cacheEnabled: true,
  cacheTTL: 3600,
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000,
  },
  logLevel: 'info',
};
