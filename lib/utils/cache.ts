import { type RedisClientType, createClient } from 'redis';

import { logger } from './logger';

const REDIS_CONFIG = {
  host: process.env['REDIS_HOST'] ?? 'localhost',
  port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
  password: process.env['REDIS_PASSWORD'] ?? '',
  db: parseInt(process.env['REDIS_DB'] ?? '0', 10),
  keyPrefix: 'crm7r:fairwork:',
} as const;

export class CacheService {
  private readonly client: RedisClientType;
  private readonly cacheLogger = logger.createLogger('CacheService');

  constructor(client: RedisClientType) {
    this.client = client;

    // Set up error handlers
    void this.client.on('error', (error: Error) => {
      this.cacheLogger.error('Redis client error', { error: error.message });
    });

    void this.client.on('end', () => {
      this.cacheLogger.warn('Redis connection ended');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.cacheLogger.error('Failed to get value from cache', { error, key });
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl !== undefined) {
        await this.client.set(key, serializedValue, {
          EX: ttl,
        });
      } else {
        await this.client.set(key, serializedValue);
      }
    } catch (error) {
      this.cacheLogger.error('Failed to set value in cache', { error, key });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.cacheLogger.error('Failed to delete value from cache', { error, key });
    }
  }

  async flushdb(): Promise<void> {
    try {
      await this.client.flushDb();
    } catch (error) {
      this.cacheLogger.error('Failed to flush cache', { error });
    }
  }

  async quit(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      this.cacheLogger.error('Failed to quit Redis client', { error });
    }
  }
}

// Create a singleton Redis client
const redisClient = createClient({
  url: `redis://${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`,
  password: REDIS_CONFIG.password || undefined,
  database: REDIS_CONFIG.db,
});

export const cache = new CacheService(redisClient);
