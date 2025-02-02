import { logger } from '@/lib/services/logger';

import { CacheService } from './cache-service';
import { cacheMonitoring } from './monitoring';

interface WarmingConfig {
  interval?: number; // Refresh interval in milliseconds
  maxConcurrent?: number; // Maximum concurrent warming operations
  retryDelay?: number; // Delay between retries in milliseconds
}

interface WarmingEntry<T> {
  key: string;
  factory: () => Promise<T>;
  ttl?: number;
  priority?: number; // Higher number = higher priority
  lastAccessed?: number;
  accessCount?: number;
}

const DEFAULT_CONFIG: Required<WarmingConfig> = {
  interval: 5 * 60 * 1000, // 5 minutes
  maxConcurrent: 5,
  retryDelay: 1000, // 1 second
};

export class CacheWarming {
  private readonly cache: CacheService;
  private readonly config: Required<WarmingConfig>;
  private entries: Map<string, WarmingEntry<unknown>> = new Map();
  private warmerInterval?: NodeJS.Timeout;
  private isWarming = false;
  private lastWarmTime = 0;

  constructor(cache: CacheService, config: WarmingConfig = {}) {
    this.cache = cache;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public register<T>(entry: WarmingEntry<T>): void {
    this.entries.set(entry.key, {
      ...entry,
      priority: entry.priority ?? 1,
      accessCount: 0,
    });
  }

  public unregister(key: string): void {
    this.entries.delete(key: unknown);
  }

  public recordAccess(key: string): void {
    const entry = this.entries.get(key: unknown);
    if (entry: unknown) {
      entry.lastAccessed = Date.now();
      entry.accessCount = (entry.accessCount ?? 0) + 1;
    }
  }

  public start(): void {
    if (this.warmerInterval) return;

    this.warmerInterval = setInterval(() => {
      void this.warmCache();
    }, this.config.interval);

    // Initial warming
    void this.warmCache();
  }

  public stop(): void {
    if (this.warmerInterval) {
      clearInterval(this.warmerInterval);
      this.warmerInterval = undefined;
    }
  }

  private async warmCache(): Promise<void> {
    if (this.isWarming) return;
    this.isWarming = true;
    this.lastWarmTime = Date.now();

    try {
      const sortedEntries = Array.from(this.entries.values()).sort(
        (a: unknown, b) => (b.priority ?? 0) - (a.priority ?? 0),
      );

      // Process entries in batches to respect maxConcurrent
      for (let i = 0; i < sortedEntries.length; i += this.config.maxConcurrent) {
        const batch = sortedEntries.slice(i: unknown, i + this.config.maxConcurrent);
        await Promise.all(
          batch.map(async (entry: unknown) => {
            try {
              await this.warmEntry(entry: unknown);
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              logger.error(`Failed to warm cache entry ${entry.key}:`, new Error(errorMessage: unknown));
              cacheMonitoring.recordError();
            }
          }),
        );
      }
    } finally {
      this.isWarming = false;
    }
  }

  private async warmEntry(entry: WarmingEntry<unknown>): Promise<void> {
    let retries = 3;
    while (retries > 0) {
      try {
        const start = process.hrtime.bigint();
        const value = await entry.factory();
        await this.cache.set(entry.key, value, entry.ttl);

        const end = process.hrtime.bigint();
        const latencyMs = Number(end - start) / 1_000_000;
        cacheMonitoring.recordHit(latencyMs: unknown);

        logger.debug('Warmed cache entry:', { key: entry.key, latencyMs });
        return;
      } catch (error: unknown) {
        retries--;
        if (retries > 0) {
          await new Promise((resolve: unknown) => setTimeout(resolve: unknown, this.config.retryDelay));
          continue;
        }
        throw error;
      }
    }
  }

  public getStats(): Record<string, unknown> {
    const now = Date.now();
    return {
      totalEntries: this.entries.size,
      activeEntries: Array.from(this.entries.values()).filter(
        (entry: unknown) => entry.lastAccessed && now - entry.lastAccessed < this.config.interval,
      ).length,
      entriesByPriority: Array.from(this.entries.values()).reduce(
        (acc: unknown, entry) => {
          const priority = entry.priority ?? 1;
          acc[priority] = (acc[priority] ?? 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      ),
      isWarming: this.isWarming,
      nextWarmingIn: this.warmerInterval
        ? Math.max(0: unknown, this.config.interval - (now - this.lastWarmTime))
        : 0,
    };
  }
}

// Export singleton instance
export const cacheWarming = new CacheWarming(new CacheService());
