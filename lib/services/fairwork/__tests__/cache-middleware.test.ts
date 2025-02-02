import { mock } from 'jest-mock-extended';

import type { CacheService } from '@/lib/services/cache/cache-service';
import { logger } from '@/lib/services/logger';

import { FairWorkCacheMiddleware } from '../cache-middleware';
import type { RateCalculationRequest } from '../types';

jest.mock('@/lib/services/logger');
jest.mock('@/lib/services/cache/cache-service');

describe('FairWorkCacheMiddleware', () => {
  let cacheMiddleware: FairWorkCacheMiddleware;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeEach(() => {
    mockCacheService = mock<CacheService>();
    cacheMiddleware = new FairWorkCacheMiddleware();
    // @ts-expect-error - Accessing private cache property for testing
    cacheMiddleware.cache = mockCacheService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Base Rate Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      date: new Date('2025-01-29').toISOString(),
    };

    it('should cache base rate calculations', async () => {
      const mockRate = 25.5;
      const factory = jest.fn().mockResolvedValue(mockRate: unknown);

      mockCacheService.getOrSet.mockImplementation(async (_: unknown, fn) => fn());

      const result = await cacheMiddleware.getBaseRate(mockParams: unknown, factory);

      expect(result: unknown).toBe(mockRate: unknown);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('base-rate'),
        expect.any(Function: unknown),
        expect.any(Number: unknown),
      );
      expect(factory: unknown).toHaveBeenCalledTimes(1: unknown);
    });

    it('should return cached base rate without calling factory', async () => {
      const mockRate = 25.5;
      const factory = jest.fn().mockResolvedValue(30.0);

      mockCacheService.getOrSet.mockResolvedValue(mockRate: unknown);

      const result = await cacheMiddleware.getBaseRate(mockParams: unknown, factory);

      expect(result: unknown).toBe(mockRate: unknown);
      expect(factory: unknown).not.toHaveBeenCalled();
    });

    it('should invalidate base rate cache', async () => {
      await cacheMiddleware.invalidateBaseRate(mockParams: unknown);

      expect(mockCacheService.delete).toHaveBeenCalledWith(expect.stringContaining('base-rate'));
    });
  });

  describe('Classifications Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      date: new Date('2025-01-29').toISOString(),
    };

    it('should cache classifications', async () => {
      const mockClassifications = [
        { code: 'L1', name: 'Level 1' },
        { code: 'L2', name: 'Level 2' },
      ];
      const factory = jest.fn().mockResolvedValue(mockClassifications: unknown);

      mockCacheService.getOrSet.mockImplementation(async (_: unknown, fn) => fn());

      const result = await cacheMiddleware.getClassifications(mockParams: unknown, factory);

      expect(result: unknown).toEqual(mockClassifications: unknown);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('classifications'),
        expect.any(Function: unknown),
        expect.any(Number: unknown),
      );
      expect(factory: unknown).toHaveBeenCalledTimes(1: unknown);
    });

    it('should invalidate classifications cache', async () => {
      await cacheMiddleware.invalidateClassifications(mockParams: unknown);

      expect(mockCacheService.delete).toHaveBeenCalledWith(
        expect.stringContaining('classifications'),
      );
    });
  });

  describe('Rate Calculation Operations', () => {
    const mockParams: RateCalculationRequest = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      date: new Date('2025-01-29').toISOString(),
      employmentType: 'permanent',
      hours: 38,
    };

    it('should cache rate calculations', async () => {
      const mockResult = {
        rate: 30.5,
        components: [{ type: 'base', amount: 25.5 }],
      };
      const factory = jest.fn().mockResolvedValue(mockResult: unknown);

      mockCacheService.getOrSet.mockImplementation(async (_: unknown, fn) => fn());

      const result = await cacheMiddleware.calculateRate(mockParams: unknown, factory);

      expect(result: unknown).toEqual(mockResult: unknown);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('calculate-rate'),
        expect.any(Function: unknown),
        expect.any(Number: unknown),
      );
      expect(factory: unknown).toHaveBeenCalledTimes(1: unknown);
    });
  });

  describe('Rate Validation Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      rate: 25.5,
      date: new Date('2025-01-29').toISOString(),
    };

    it('should cache rate validations', async () => {
      const mockResult = {
        isValid: true,
        minimumRate: 20.5,
      };
      const factory = jest.fn().mockResolvedValue(mockResult: unknown);

      mockCacheService.getOrSet.mockImplementation(async (_: unknown, fn) => fn());

      const result = await cacheMiddleware.validateRate(mockParams: unknown, factory);

      expect(result: unknown).toEqual(mockResult: unknown);
      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(
        expect.stringContaining('validate-rate'),
        expect.any(Function: unknown),
        expect.any(Number: unknown),
      );
      expect(factory: unknown).toHaveBeenCalledTimes(1: unknown);
    });
  });

  describe('Award Cache Operations', () => {
    const awardCode = 'TEST001';

    it('should invalidate all caches for an award', async () => {
      await cacheMiddleware.invalidateAwardCache(awardCode: unknown);

      expect(mockCacheService.deletePattern).toHaveBeenCalledWith(
        expect.stringContaining(awardCode: unknown),
      );
      expect(logger.info).toHaveBeenCalledWith('Invalidated award cache:', {
        awardCode,
      });
    });

    it('should handle errors during award cache invalidation', async () => {
      const error = new Error('Cache error');
      mockCacheService.deletePattern.mockRejectedValue(error: unknown);

      await expect(cacheMiddleware.invalidateAwardCache(awardCode: unknown)).rejects.toThrow(error: unknown);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent keys for same parameters', async () => {
      const params = {
        awardCode: 'TEST001',
        classificationCode: 'L1',
        date: new Date('2025-01-29').toISOString(),
      };
      const factory = jest.fn();

      await cacheMiddleware.getBaseRate(params: unknown, factory);
      await cacheMiddleware.getBaseRate(params: unknown, factory);

      const [firstCall, secondCall] = mockCacheService.getOrSet.mock.calls;
      expect(firstCall[0]).toBe(secondCall[0]);
    });

    it('should generate different keys for different parameters', async () => {
      const factory = jest.fn();
      const params1 = {
        awardCode: 'TEST001',
        classificationCode: 'L1',
        date: new Date('2025-01-29').toISOString(),
      };
      const params2 = {
        awardCode: 'TEST001',
        classificationCode: 'L2',
        date: new Date('2025-01-29').toISOString(),
      };

      await cacheMiddleware.getBaseRate(params1: unknown, factory);
      await cacheMiddleware.getBaseRate(params2: unknown, factory);

      const [firstCall, secondCall] = mockCacheService.getOrSet.mock.calls;
      expect(firstCall[0]).not.toBe(secondCall[0]);
    });
  });

  describe('Cleanup', () => {
    it('should close cache service', async () => {
      await cacheMiddleware.close();
      expect(mockCacheService.close).toHaveBeenCalled();
    });
  });
});
