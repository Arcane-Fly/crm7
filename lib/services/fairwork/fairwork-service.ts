import { type RedisClientType } from 'redis';

import { CacheService } from '@/lib/utils/cache';
import { logger } from '@/lib/utils/logger';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';

import { type FairWorkApiClient } from './api-client';
import {
  type Award,
  type Classification,
  type ClassificationHierarchy,
  type Rate,
  type RateTemplate,
  type RateValidationRequest,
  type RateValidationResponse,
} from './types';

export interface FairWorkService {
  getActiveAwards(): Promise<Award[]>;
  getAward(awardCode: string): Promise<Award | null>;
  getCurrentRates(awardCode: string): Promise<Rate[]>;
  getRatesForDate(awardCode: string, date?: string): Promise<Rate[]>;
  getClassifications(awardCode: string): Promise<Classification[]>;
  getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy>;
  getRateTemplates(awardCode: string): Promise<RateTemplate[]>;
  validateRate(params: RateValidationRequest): Promise<RateValidationResponse>;
  calculateBaseRate(params: {
    awardCode: string;
    classification: string;
  }): Promise<{ baseRate: number }>;
}

export class FairWorkServiceImpl extends BaseService implements FairWorkService {
  private readonly apiClient: FairWorkApiClient;
  private readonly cache: CacheService;
  private readonly serviceLogger = logger.createLogger('FairWorkService');
  private readonly CACHE_TTL = 3600;

  constructor(apiClient: FairWorkApiClient, redisClient: RedisClientType, options: ServiceOptions) {
    super(options);
    this.apiClient = apiClient;
    this.cache = new CacheService(redisClient);
  }

  async getActiveAwards(): Promise<void> {
    return this.executeServiceMethod('getActiveAwards', async () => {
      try {
        const cacheKey = 'active_awards';
        const cachedAwards = await this.cache.get<Award[]>(cacheKey);

        if (typeof cachedAwards !== "undefined" && cachedAwards !== null) {
          return cachedAwards;
        }

        const { items: awards } = await this.apiClient.getActiveAwards();
        await this.cache.set(cacheKey, awards, this.CACHE_TTL);
        return awards;
      } catch (error) {
        this.serviceLogger.error('Failed to get active awards', { error });
        throw error;
      }
    });
  }

  async getAward(awardCode: string): Promise<void> {
    return this.executeServiceMethod('getAward', async () => {
      try {
        const cacheKey = `award:${awardCode}`;
        const cachedAward = await this.cache.get<Award>(cacheKey);

        if (typeof cachedAward !== "undefined" && cachedAward !== null) {
          return cachedAward;
        }

        const awards = await this.getActiveAwards();
        const award = awards.find((a) => a.code === awardCode);

        if (typeof award !== "undefined" && award !== null) {
          await this.cache.set(cacheKey, award, this.CACHE_TTL);
        }

        return award ?? null;
      } catch (error) {
        this.serviceLogger.error('Failed to get award', { error, awardCode });
        throw error;
      }
    });
  }

  async getCurrentRates(awardCode: string): Promise<void> {
    return this.executeServiceMethod('getCurrentRates', async () => {
      try {
        const cacheKey = `rates:${awardCode}:current`;
        const cachedRates = await this.cache.get<Rate[]>(cacheKey);

        if (typeof cachedRates !== "undefined" && cachedRates !== null) {
          return cachedRates;
        }

        const rates = await this.apiClient.getCurrentRates(awardCode);
        await this.cache.set(cacheKey, rates, this.CACHE_TTL);
        return rates;
      } catch (error) {
        this.serviceLogger.error('Failed to get current rates', { error, awardCode });
        throw error;
      }
    });
  }

  async getRatesForDate(awardCode: string, date: string = new Date().toISOString()): Promise<void> {
    return this.executeServiceMethod('getRatesForDate', async () => {
      try {
        const cacheKey = `rates:${awardCode}:${date}`;
        const cachedRates = await this.cache.get<Rate[]>(cacheKey);

        if (typeof cachedRates !== "undefined" && cachedRates !== null) {
          return cachedRates;
        }

        const rates = await this.apiClient.getRatesForDate(awardCode, date);
        await this.cache.set(cacheKey, rates, this.CACHE_TTL);
        return rates;
      } catch (error) {
        this.serviceLogger.error('Failed to get rates for date', { error, awardCode, date });
        throw error;
      }
    });
  }

  async getClassifications(awardCode: string): Promise<void> {
    return this.executeServiceMethod('getClassifications', async () => {
      try {
        const cacheKey = `classifications:${awardCode}`;
        const cachedClassifications = await this.cache.get<Classification[]>(cacheKey);

        if (typeof cachedClassifications !== "undefined" && cachedClassifications !== null) {
          return cachedClassifications;
        }

        const classifications = await this.apiClient.getClassifications(awardCode);
        await this.cache.set(cacheKey, classifications, this.CACHE_TTL);
        return classifications;
      } catch (error) {
        this.serviceLogger.error('Failed to get classifications', { error, awardCode });
        throw error;
      }
    });
  }

  async getClassificationHierarchy(awardCode: string): Promise<void> {
    return this.executeServiceMethod('getClassificationHierarchy', async () => {
      try {
        const cacheKey = `classification_hierarchy:${awardCode}`;
        const cachedHierarchy = await this.cache.get<ClassificationHierarchy>(cacheKey);

        if (typeof cachedHierarchy !== "undefined" && cachedHierarchy !== null) {
          return cachedHierarchy;
        }

        const hierarchy = await this.apiClient.getClassificationHierarchy(awardCode);
        await this.cache.set(cacheKey, hierarchy, this.CACHE_TTL);
        return hierarchy;
      } catch (error) {
        this.serviceLogger.error('Failed to get classification hierarchy', { error, awardCode });
        throw error;
      }
    });
  }

  async getRateTemplates(awardCode: string): Promise<void> {
    return this.executeServiceMethod('getRateTemplates', async () => {
      try {
        const cacheKey = `rate_templates:${awardCode}`;
        const cachedTemplates = await this.cache.get<RateTemplate[]>(cacheKey);

        if (typeof cachedTemplates !== "undefined" && cachedTemplates !== null) {
          return cachedTemplates;
        }

        const templates = await this.apiClient.getRateTemplates(awardCode);
        await this.cache.set(cacheKey, templates, this.CACHE_TTL);
        return templates;
      } catch (error) {
        this.serviceLogger.error('Failed to get rate templates', { error, awardCode });
        throw error;
      }
    });
  }

  async validateRate(params: RateValidationRequest): Promise<void> {
    return this.executeServiceMethod('validateRate', async () => {
      try {
        return await this.apiClient.validateRate(params);
      } catch (error) {
        this.serviceLogger.error('Failed to validate rate', { error, params });
        throw error;
      }
    });
  }

  async calculateBaseRate(params: {
    awardCode: string;
    classification: string;
  }): Promise<void> {
    return this.executeServiceMethod('calculateBaseRate', async () => {
      try {
        const { awardCode, classification } = params;
        const rates = await this.getCurrentRates(awardCode);
        const baseRate = rates.find((r) => r.penalties?.some(p => p.code === classification))?.baseRate;

        if (!baseRate) {
          throw new Error(`Base rate not found for classification ${classification}`);
        }

        return { baseRate };
      } catch (error) {
        this.serviceLogger.error('Failed to calculate base rate', { error, params });
        throw error;
      }
    });
  }
}
