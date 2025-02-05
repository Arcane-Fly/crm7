import { type FairWorkService } from '../fairwork';
import { CacheService } from '../cache/cache-service';
import { logger } from '@/lib/logger';

interface CacheWarmingConfig {
  interval: number;
  maxConcurrent: number;
  retryDelay: number;
}

export class FairWorkCacheWarming {
  private readonly cache: CacheService;
  private readonly fairWorkService: FairWorkService;
  private isWarming = false;
  private lastWarmTime = 0;

  constructor(
    fairWorkService: FairWorkService,
    private readonly config: CacheWarmingConfig
  ) {
    this.fairWorkService = fairWorkService;
    this.cache = new CacheService({
      keyPrefix: 'fairwork',
      defaultTtl: 3600,
    });
  }

  async warmCache(): Promise<void> {
    if (this.isWarming) {
      logger.warn('Cache warming already in progress');
      return;
    }

    try {
      this.isWarming = true;

      const params = this.getDateRange();
      await Promise.all([
        this.warmClassifications(params),
        this.warmRates(params),
        this.warmFutureRates(params),
      ]);

      this.lastWarmTime = Date.now();
    } catch (error) {
      logger.error('Failed to warm cache:', error);
    } finally {
      this.isWarming = false;
    }
  }

  private async warmClassifications(params: Record<string, unknown>): Promise<void> {
    try {
      await this.cache.set(
        'classifications',
        await this.fairWorkService.getClassifications(params),
        3600
      );
    } catch (error) {
      logger.error('Failed to warm classifications cache:', error);
    }
  }

  private async warmRates(params: Record<string, unknown>): Promise<void> {
    try {
      await this.cache.set(
        'rates',
        await this.fairWorkService.getRates(params),
        3600
      );
    } catch (error) {
      logger.error('Failed to warm rates cache:', error);
    }
  }

  private async warmFutureRates(params: Record<string, unknown>): Promise<void> {
    try {
      await this.cache.set(
        'future-rates',
        await this.fairWorkService.getFutureRates(params),
        3600
      );
    } catch (error) {
      logger.error('Failed to warm future rates cache:', error);
    }
  }

  private getDateRange(): Record<string, string> {
    const today = new Date();
    const date = new Date();
    date.setMonth(date.getMonth() + 3);

    return {
      startDate: today.toISOString(),
      endDate: date.toISOString(),
    };
  }

  start(): void {
    void this.warmCache();
    setInterval((): undefined => void this.warmCache(), this.config.interval);
  }

  stop(): void {
    this.isWarming = false;
  }
}
