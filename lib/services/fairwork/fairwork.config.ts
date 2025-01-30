import { z } from 'zod';

/**
 * Fair Work API configuration schema
 */
export const FairWorkConfigSchema = z.object({
  // API credentials
  apiKey: z.string().min(1),
  apiUrl: z.string().url(),
  baseUrl: z.string().url(),
  environment: z.enum(['sandbox', 'production']),

  // Request settings
  timeout: z.number().min(1000).max(60000).default(30000),
  retryAttempts: z.number().min(0).max(5).default(3),

  // Cache settings
  cacheEnabled: z.boolean().default(true),
  cacheTTL: z.number().min(0).max(86400).default(3600), // 1 hour in seconds

  // Rate limiting
  rateLimit: z
    .object({
      maxRequests: z.number().min(1).default(100),
      windowMs: z.number().min(1000).default(60000), // 1 minute in milliseconds
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
  apiKey: process.env.FAIRWORK_API_KEY || '',
  apiUrl: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au/v1',
  baseUrl: process.env.FAIRWORK_BASE_URL || 'https://api.fairwork.gov.au',
  environment: (process.env.FAIRWORK_ENV || 'sandbox') as 'sandbox' | 'production',
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
