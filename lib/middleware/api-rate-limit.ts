import rateLimit from 'express-rate-limit';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ApiError } from '@/lib/utils/error';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitStore {
  key: string;
  value: number;
  expires: number;
  totalHits: number;
  resetTime: Date;
}

// Create a map to store rate limit state in memory
const rateLimitStateMap = new Map<string, RateLimitStore>();

export const rateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: {
    // Simple in-memory store
    init: function (): void {
      rateLimitStateMap.clear();
    },
    increment: async function (key: string): Promise<RateLimitStore> {
      const currentTime = Date.now();
      const existingStore = rateLimitStateMap.get(key);
      const currentStore: RateLimitStore = existingStore || { 
        key, 
        value: 0, 
        expires: currentTime + WINDOW_MS,
        totalHits: 0,
        resetTime: new Date(currentTime + WINDOW_MS)
      };

      // Clear expired entries
      if (currentStore.expires <= currentTime) {
        currentStore.value = 0;
        currentStore.expires = currentTime + WINDOW_MS;
      }

      currentStore.value += 1;
      rateLimitStateMap.set(key, currentStore);
      
      const store: RateLimitStore = {
        key: currentStore.key,
        value: currentStore.value,
        expires: currentStore.expires,
        totalHits: currentStore.value,
        resetTime: new Date(currentStore.expires)
      };
      rateLimitStateMap.set(key, store);
      return Promise.resolve(store);
    },
    decrement: function (key: string): Promise<void> {
      const store = rateLimitStateMap.get(key);
      if (store) {
        store.value = Math.max(0, store.value - 1);
        rateLimitStateMap.set(key, store);
      }
      return Promise.resolve();
    },
    resetKey: function (key: string): Promise<void> {
      rateLimitStateMap.delete(key);
      return Promise.resolve();
    },
    resetAll: function (): Promise<void> {
      rateLimitStateMap.clear();
      return Promise.resolve();
    },
  },
  keyGenerator: (req: NextApiRequest): string => {
    // Use IP and optional user ID for rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.id;
    return `${ip}-${userId || 'anonymous'}`;
  },
  handler: (_req: NextApiRequest, _res: NextApiResponse): void => {
    throw new ApiError({
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    });
  },
  skip: (_req: NextApiRequest): boolean => {
    // Skip rate limiting for certain paths or in development
    return process.env.NODE_ENV === 'development';
  },
});

// Middleware wrapper for Next.js API routes
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  return async function rateLimit(req: NextApiRequest, res: NextApiResponse) {
    try {
      await new Promise((resolve, reject) => {
        rateLimiter(req, res, (result: Error | undefined) => {
          if (result) reject(result);
          resolve(result);
        });
      });
      return handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode || 429).json({
          error: error.message,
          code: error.code,
        });
      }
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    }
  };
}
