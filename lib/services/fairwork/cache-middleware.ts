import { CacheService } from '@/lib/services/cache/cache-service';
import { logger } from '@/lib/services/logger';

import type {
  GetBaseRateParams,
  GetClassificationsParams,
  GetFutureRatesParams,
  GetRateHistoryParams,
  RateCalculationRequest,
  ValidateRateParams,
} from './types';

class LogError extends Error {
  constructor(
    message: string,
    public readonly details: {
      error?: string;
      awardCode?: string;
      [key: string]: unknown;
    },
  ) {
    super(message);
    this.name = 'LogError';
  }
}

const CACHE_CONFIG = {
  ttl: 24 * 60 * 60, // 24 hours default TTL
  prefix: 'fairwork:',
  retryCount: 3,
};

const TTL_CONFIG = {
  baseRate: 24 * 60 * 60, // 24 hours
  classifications: 7 * 24 * 60 * 60, // 7 days
  futureRates: 24 * 60 * 60, // 24 hours
  rateHistory: 7 * 24 * 60 * 60, // 7 days
  validation: 24 * 60 * 60, // 24 hours
  calculation: 24 * 60 * 60, // 24 hours
};

export class FairWorkCacheMiddleware {
  private readonly cache: CacheService;

  constructor() {
    this.cache = new CacheService(CACHE_CONFIG);
  }

  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join('|');

    return `${prefix}:${sortedParams}`;
  }

  async getBaseRate<T>(params: GetBaseRateParams, factory: () => Promise<T>): Promise<T> {
    const key = this.generateKey('base-rate', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.baseRate);
  }

  async getClassifications<T>(
    params: GetClassificationsParams,
    factory: () => Promise<T>,
  ): Promise<T> {
    const key = this.generateKey('classifications', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.classifications);
  }

  async getFutureRates<T>(params: GetFutureRatesParams, factory: () => Promise<T>): Promise<T> {
    const key = this.generateKey('future-rates', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.futureRates);
  }

  async getRateHistory<T>(params: GetRateHistoryParams, factory: () => Promise<T>): Promise<T> {
    const key = this.generateKey('rate-history', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.rateHistory);
  }

  async validateRate<T>(params: ValidateRateParams, factory: () => Promise<T>): Promise<T> {
    const key = this.generateKey('validate-rate', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.validation);
  }

  private toRecord(obj: unknown): Record<string, unknown> {
    if (obj && typeof obj === 'object') {
      return Object.entries(obj).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, unknown>,
      );
    }
    return {};
  }

  async calculateRate<T>(params: RateCalculationRequest, factory: () => Promise<T>): Promise<T> {
    const key = this.generateKey('calculate-rate', this.toRecord(params));
    return this.cache.getOrSet(key, factory, TTL_CONFIG.calculation);
  }

  async invalidateBaseRate(params: GetBaseRateParams): Promise<void> {
    const key = this.generateKey('base-rate', params);
    await this.cache.delete(key);
  }

  async invalidateClassifications(params: GetClassificationsParams): Promise<void> {
    const key = this.generateKey('classifications', params);
    await this.cache.delete(key);
  }

  async invalidateAwardCache(awardCode: string): Promise<void> {
    try {
      // Invalidate all caches related to this award
      await this.cache.deletePattern(`*${awardCode}*`);
      logger.info('Invalidated award cache:', { awardCode });
    } catch (error) {
      const logError = new LogError('Failed to invalidate award cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        awardCode,
      });
      logger.error('Failed to invalidate award cache:', logError);
      throw error;
    }
  }

  async invalidateAll(): Promise<void> {
    await this.cache.clear();
  }

  async close(): Promise<void> {
    await this.cache.close();
  }
}

export default FairWorkCacheMiddleware;
