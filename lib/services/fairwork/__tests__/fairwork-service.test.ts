import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { mock } from 'jest-mock-extended';

import { logger } from '@/lib/services/logger';
import { ApiError } from '@/lib/utils/error';

import { FairWorkCacheMiddleware } from '../cache-middleware';
import { FairWorkService } from '../fairwork-service';
import type { RateCalculationRequest, RateCalculationResponse } from '../types';

jest.mock('@/lib/services/logger');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mock<SupabaseClient>()),
}));
jest.mock('../cache-middleware');

describe('FairWorkService', () => {
  let service: FairWorkService;
  let mockSupabase: jest.Mocked<SupabaseClient>;
  let mockCache: jest.Mocked<FairWorkCacheMiddleware>;

  const mockConfig = {
    apiKey: 'test-key',
    baseUrl: 'https://api.test',
  };

  beforeEach(() => {
    mockSupabase = mock<SupabaseClient>();
    mockCache = mock<FairWorkCacheMiddleware>();
    (FairWorkCacheMiddleware as jest.Mock).mockImplementation(() => mockCache);

    service = new FairWorkService(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Base Rate Operations', () => {
    const mockParams = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      date: new Date('2025-01-29'),
    };

    it('should use cache for base rate calculations', async () => {
      const mockRate = 25.5;
      mockCache.getBaseRate.mockImplementation(async (_, factory) => factory());

      const result = await service.getBaseRate(mockParams);

      expect(result).toBe(mockRate);
      expect(mockCache.getBaseRate).toHaveBeenCalledWith(mockParams, expect.any(Function));
    });

    it('should handle API errors with caching', async () => {
      const error = new Error('API Error');
      mockCache.getBaseRate.mockRejectedValue(error);

      await expect(service.getBaseRate(mockParams)).rejects.toThrow(ApiError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Rate Calculation Operations', () => {
    const mockRequest: RateCalculationRequest = {
      awardCode: 'TEST001',
      classificationCode: 'L1',
      employmentType: 'permanent',
      date: new Date('2025-01-29'),
      hours: 38,
    };

    const mockResponse: RateCalculationResponse = {
      baseRate: 25.5,
      penalties: [],
      allowances: [],
      total: 25.5,
      breakdown: {
        base: 25.5,
        penalties: 0,
        allowances: 0,
      },
      metadata: {
        calculatedAt: new Date(),
        effectiveDate: new Date('2025-01-29'),
        source: 'fairwork',
      },
    };

    it('should use cache for rate calculations', async () => {
      const mockSuccessResponse = {
        data: mockResponse,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
        body: mockResponse,
      };
      mockSupabase.rpc.mockResolvedValue(mockSuccessResponse);
      mockCache.calculateRate.mockImplementation(async (_, factory) => factory());

      const result = await service.calculateRate(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(mockCache.calculateRate).toHaveBeenCalledWith(mockRequest, expect.any(Function));
    });

    it('should handle Supabase errors with caching', async () => {
      const mockErrorResponse = {
        data: null,
        error: {
          message: 'Database error',
          details: 'Failed to execute RPC',
          hint: 'Check database connection',
          code: 'DB_ERROR',
          name: 'PostgrestError',
        } as PostgrestError,
        count: null,
        status: 500,
        statusText: 'Internal Server Error',
        body: null,
      };
      mockSupabase.rpc.mockResolvedValue(mockErrorResponse);
      mockCache.calculateRate.mockImplementation(async (_, factory) => factory());

      await expect(service.calculateRate(mockRequest)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle cache errors gracefully', async () => {
      const error = new Error('Cache error');
      mockCache.calculateRate.mockRejectedValue(error);

      await expect(service.calculateRate(mockRequest)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Award Cache Operations', () => {
    const awardCode = 'TEST001';

    it('should invalidate cache when award rates change', async () => {
      await service.getAwardRates(awardCode);

      expect(mockCache.invalidateAwardCache).toHaveBeenCalledWith(awardCode);
    });

    it('should handle cache invalidation errors', async () => {
      const error = new Error('Cache error');
      mockCache.invalidateAwardCache.mockRejectedValue(error);

      await expect(service.getAwardRates(awardCode)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should close cache service on cleanup', async () => {
      await service.close();
      expect(mockCache.close).toHaveBeenCalled();
    });
  });
});
