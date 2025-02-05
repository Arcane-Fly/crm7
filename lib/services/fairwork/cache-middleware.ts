import { CacheService } from '../cache/cache-service';
import { type FairWorkApiClient } from './api-client';
const TTL_CONFIG = {
  baseRate: 3600, // 1 hour
  classifications: 7200, // 2 hours
  futureRates: 14400, // 4 hours
  allowances: 3600, // 1 hour
  penalties: 3600, // 1 hour
  leaveEntitlements: 7200, // 2 hours
};

const CACHE_CONFIG = {
  keyPrefix: 'fairwork',
  defaultTtl: TTL_CONFIG.baseRate,
};

export class FairWorkCacheError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FairWorkCacheError';
  }
}

export class FairWorkCacheMiddleware {
  private readonly cache: CacheService;
  private readonly client: FairWorkApiClient;

  constructor(client: FairWorkApiClient) {
    this.client = client;
    this.cache = new CacheService(CACHE_CONFIG);
  }

  private getCacheKey(endpoint: string, params: Record<string, unknown>): string {
    const sortedParams = Object.entries(params)
      .sort(([a], [b]): number => a.localeCompare(b))
      .map(([key, value]) => `${key}:${JSON.stringify(value)}`)
      .join(',');

    return `${endpoint}:${sortedParams}`;
  }

  async getBaseRate(params: Record<string, unknown>, factory: () => Promise<unknown>): Promise<void> {
    const key = this.getCacheKey('base-rate', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.baseRate);
  }

  async getClassifications(
    params: Record<string, unknown>,
    factory: () => Promise<unknown>
  ): Promise<void> {
    const key = this.getCacheKey('classifications', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.classifications);
  }

  async getFutureRates(params: Record<string, unknown>, factory: () => Promise<unknown>): Promise<void> {
    const key = this.getCacheKey('future-rates', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.futureRates);
  }

  async getAllowances(params: Record<string, unknown>, factory: () => Promise<unknown>): Promise<void> {
    const key = this.getCacheKey('allowances', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.allowances);
  }

  async getPenalties(params: Record<string, unknown>, factory: () => Promise<unknown>): Promise<void> {
    const key = this.getCacheKey('penalties', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.penalties);
  }

  async getLeaveEntitlements(
    params: Record<string, unknown>,
    factory: () => Promise<unknown>
  ): Promise<void> {
    const key = this.getCacheKey('leave-entitlements', params);
    return this.cache.getOrSet(key, factory, TTL_CONFIG.leaveEntitlements);
  }
}
