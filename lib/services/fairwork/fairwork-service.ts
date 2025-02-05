import { type RedisClientType } from 'redis';

import { CacheService } from '@/lib/utils/cache';
import { logger } from '@/lib/utils/logger';
import { BaseService, type ServiceOptions } from '@/lib/utils/service';

import { type FairWorkApiClient } from './api-client';
import {
  type Award,
  type Classification,
  type ClassificationHierarchy,
  type PayRate,
  type RateTemplate,
  type RateValidationRequest,
  type RateValidationResponse,
} from './types';

export interface FairWorkService {
  getActiveAwards(): Promise<Award[]>;
  getAward(awardCode: string): Promise<Award | null>;
  getCurrentRates(awardCode: string): Promise<PayRate[]>;
  getRatesForDate(awardCode: string, date?: string): Promise<PayRate[]>;
  getClassifications(awardCode: string): Promise<Classification[]>;
  getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy | null>;
  getRateTemplates(awardCode: string): Promise<RateTemplate[]>;
  validateRate(params: RateValidationRequest): Promise<RateValidationResponse | null>;
  calculateBaseRate(params: { awardCode: string; classificationCode: string }): Promise<number | null>;
}

export class FairWorkServiceImpl extends BaseService implements FairWorkService {
  static instance: FairWorkService;
  private readonly apiClient: FairWorkApiClient;
  private readonly cache: CacheService;
  private readonly serviceLogger = logger.createLogger('FairWorkService');
  private readonly CACHE_TTL = 3600;

  constructor(apiClient: FairWorkApiClient, redisClient: RedisClientType, options: ServiceOptions) {
    super(options);
    this.apiClient = apiClient;
    this.cache = new CacheService(redisClient);
  }

  public async getActiveAwards(): Promise<Award[]> {
    return await this.executeServiceMethod('getActiveAwards', async (): Promise<Award[]> => {
      try {
        const cacheKey = 'active_awards';
        const cachedAwards = await this.cache.get<Award[]>(cacheKey);
        if (cachedAwards) {
          return cachedAwards;
        }
        const page = await this.apiClient.getActiveAwards();
        const awards = page.items;
        await this.cache.set(cacheKey, awards, this.CACHE_TTL);
        return awards;
      } catch (error) {
        this.serviceLogger.error('Failed to get active awards', { error });
        return [];
      }
    });
  }

  public async getAward(awardCode: string): Promise<Award | null> {
    return this.executeServiceMethod('getAward', async (): Promise<Award | null> => {
      try {
        const cacheKey = `award:${awardCode}`;
        const cachedAward = await this.cache.get<Award>(cacheKey);
        if (cachedAward) {
          return cachedAward;
        }
        const awards = await this.getActiveAwards();
        const award = awards.find((a) => a.code === awardCode) || null;
        if (award) {
          await this.cache.set(cacheKey, award, this.CACHE_TTL);
        }
        return award;
      } catch (error) {
        this.serviceLogger.error('Failed to get award', { error, awardCode });
        return null;
      }
    });
  }

  public async getCurrentRates(awardCode: string): Promise<PayRate[]> {
    return this.executeServiceMethod('getCurrentRates', async (): Promise<PayRate[]> => {
      try {
        const cacheKey = `rates:${awardCode}:current`;
        const cachedRates = await this.cache.get<PayRate[]>(cacheKey);
        if (cachedRates) {
          return cachedRates;
        }
        const rates = await this.apiClient.getCurrentRates(awardCode);
        await this.cache.set(cacheKey, rates, this.CACHE_TTL);
        return rates;
      } catch (error) {
        this.serviceLogger.error('Failed to get current rates', { error, awardCode });
        return [];
      }
    });
  }

  public async getRatesForDate(awardCode: string, date: string = new Date().toISOString()): Promise<PayRate[]> {
    return this.executeServiceMethod('getRatesForDate', async (): Promise<PayRate[]> => {
      try {
        const cacheKey = `rates:${awardCode}:${date}`;
        const cachedRates = await this.cache.get<PayRate[]>(cacheKey);
        if (cachedRates) {
          return cachedRates;
        }
        const rates = await this.apiClient.getRatesForDate(awardCode, date);
        await this.cache.set(cacheKey, rates, this.CACHE_TTL);
        return rates;
      } catch (error) {
        this.serviceLogger.error('Failed to get rates for date', { error, awardCode, date });
        return [];
      }
    });
  }

  public async getClassifications(awardCode: string): Promise<Classification[]> {
    return this.executeServiceMethod('getClassifications', async (): Promise<Classification[]> => {
      try {
        const cacheKey = `classifications:${awardCode}`;
        const cachedClassifications = await this.cache.get<Classification[]>(cacheKey);
        if (cachedClassifications) {
          return cachedClassifications;
        }
        const classifications = await this.apiClient.getClassifications(awardCode);
        await this.cache.set(cacheKey, classifications, this.CACHE_TTL);
        return classifications;
      } catch (error) {
        this.serviceLogger.error('Failed to get classifications', { error, awardCode });
        return [];
      }
    });
  }

  public async getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy | null> {
    return this.executeServiceMethod('getClassificationHierarchy', async (): Promise<ClassificationHierarchy | null> => {
      try {
        const cacheKey = `classification_hierarchy:${awardCode}`;
        const cachedHierarchy = await this.cache.get<ClassificationHierarchy>(cacheKey);
        if (cachedHierarchy) {
          return cachedHierarchy;
        }
        const hierarchy = await this.apiClient.getClassificationHierarchy(awardCode);
        await this.cache.set(cacheKey, hierarchy, this.CACHE_TTL);
        return hierarchy;
      } catch (error) {
        this.serviceLogger.error('Failed to get classification hierarchy', { error, awardCode });
        return null;
      }
    });
  }

  public async getRateTemplates(awardCode: string): Promise<RateTemplate[]> {
    return this.executeServiceMethod('getRateTemplates', async (): Promise<RateTemplate[]> => {
      try {
        const cacheKey = `rate_templates:${awardCode}`;
        const cachedTemplates = await this.cache.get<RateTemplate[]>(cacheKey);
        if (cachedTemplates) {
          return cachedTemplates;
        }
        const templates = await this.apiClient.getRateTemplates(awardCode);
        await this.cache.set(cacheKey, templates, this.CACHE_TTL);
        return templates;
      } catch (error) {
        this.serviceLogger.error('Failed to get rate templates', { error, awardCode });
        return [];
      }
    });
  }

  public async validateRate(params: RateValidationRequest): Promise<RateValidationResponse | null> {
    return this.executeServiceMethod('validateRate', async (): Promise<RateValidationResponse | null> => {
      try {
        return await this.apiClient.validateRate(params);
      } catch (error) {
        this.serviceLogger.error('Failed to validate rate', { error, params });
        return null;
      }
    });
  }

  public async calculateBaseRate(params: { awardCode: string; classificationCode: string }): Promise<number | null> {
    return this.executeServiceMethod('calculateBaseRate', async (): Promise<number | null> => {
      try {
        const { awardCode, classificationCode } = params;
        const rates = await this.getCurrentRates(awardCode);
        const rate = rates.find(r => r.classificationCode === classificationCode);
        return rate?.baseRate || null;
      } catch (error) {
        this.serviceLogger.error('Failed to calculate base rate', { error, params });
        return null;
      }
    });
  }
}

export type { FairWorkService };
