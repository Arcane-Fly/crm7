import { type CacheService } from './cache-service';
import { cacheMonitoring } from './monitoring';
import { logger } from '@/lib/logger';

interface CacheEntry {
  key: string;
  getter: () => Promise<unknown>;
  ttl?: number;
  lastWarmed?: number;
}

interface CacheWarmingConfig {
  interval: number;
  maxConcurrent: number;
  retryDelay: number;
}

export class CacheWarming {
  private entries = new Map<string, CacheEntry>();
  private lastWarmTime = 0;
  private isWarming = false;

  constructor(
    private readonly cache: CacheService,
    private readonly config: CacheWarmingConfig
  ) {}

  register(
    key: string,
    getter: () => Promise<unknown>,
    ttl?: number
  ): void {
    this.entries.set(key, { key, getter, ttl });
  }

  unregister(key: string): void {
    this.entries.delete(key);
  }

  getEntry(key: string): CacheEntry | undefined {
    const entry = this.entries.get(key);
    if (typeof entry !== "undefined" && entry !== null) {
      return entry;
    }
    return undefined;
  }

  async warmAll(): Promise<void> {
    if (this.isWarming) {
      logger.warn('Cache warming already in progress');
      return;
    }

    try {
      this.isWarming = true;

      const sortedEntries = Array.from(this.entries.values()).sort((a, b): number => {
        const aLastWarmed = a.lastWarmed ?? 0;
        const bLastWarmed = b.lastWarmed ?? 0;
        return aLastWarmed - bLastWarmed;
      });

      for (let i = 0; i < sortedEntries.length; i += this.config.maxConcurrent) {
        const batch = sortedEntries.slice(i, i + this.config.maxConcurrent);
        await Promise.all(
          batch.map(async (entry) => {
            try {
              await this.warmEntry(entry);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              logger.error(`Failed to warm cache entry ${entry.key}:`, new Error(errorMessage));
            }
          })
        );
      }

      this.lastWarmTime = Date.now();
    } finally {
      this.isWarming = false;
    }
  }

  private async warmEntry(entry: CacheEntry): Promise<void> {
    const startTime = Date.now();

    try {
      const value = await entry.getter();
      await this.cache.set(entry.key, value, entry.ttl);

      const latencyMs = Date.now() - startTime;
      cacheMonitoring.recordHit(latencyMs);

      entry.lastWarmed = Date.now();
    } catch (error) {
      const retries = 3;
      for (let i = 0; i < retries; i++) {
        try {
          await new Promise((resolve): NodeJS.Timeout => setTimeout(resolve, this.config.retryDelay));
          const value = await entry.getter();
          await this.cache.set(entry.key, value, entry.ttl);
          entry.lastWarmed = Date.now();
          return;
        } catch {
          continue;
        }
      }
      throw error;
    }
  }

  async start(): Promise<void> {
    await this.warmAll();
    this.scheduleNextWarm();
  }

  private scheduleNextWarm(): void {
    const now = Date.now();
    const delay = this.lastWarmTime === 0
      ? 0
      : Math.max(0, this.config.interval - (now - this.lastWarmTime));

    setTimeout((): void => {
      void this.warmAll().then((): void => {
        this.scheduleNextWarm();
      });
    }, delay);
  }
}
