import Redis from 'ioredis';

import { logger } from '@/lib/services/logger';

class LogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LogError';
  }
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  keyPrefix: 'fairwork:',
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

class RedisClient {
  private static instance: Redis | null = null;
  private static isConnecting = false;

  private constructor() {}

  public static async getInstance(): Promise<Redis> {
    if (RedisClient.instance) {
      return RedisClient.instance;
    }

    if (RedisClient.isConnecting) {
      // Wait for connection to complete
      while (RedisClient.isConnecting) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return RedisClient.instance!;
    }

    RedisClient.isConnecting = true;

    try {
      const redis = new Redis(REDIS_CONFIG);

      redis.on('error', (error: Error) => {
        const logError = new LogError('Redis connection error');
        logError.error = error.message;
        logError.stack = error.stack;
        logger.error('Redis connection error:', logError);
      });

      redis.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      await redis.ping();
      RedisClient.instance = redis;
      return redis;
    } catch (error) {
      const logError = new LogError('Failed to initialize Redis');
      logError.error = error instanceof Error ? error.message : 'Unknown error';
      logError.stack = error instanceof Error ? error.stack : undefined;
      logger.error('Failed to initialize Redis:', logError);
      throw error;
    } finally {
      RedisClient.isConnecting = false;
    }
  }

  public static async close(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null;
    }
  }
}

export default RedisClient;
