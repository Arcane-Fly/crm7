import { type PrismaClient } from '@prisma/client';
import { type RedisClientType } from 'redis';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type MetricsService } from '../../../utils/metrics';
import { FairWorkApiClient } from '../api-client';
import { FairWorkServiceImpl } from '../fairwork-service';
import { type Award, type Rate } from '../types';

// Create mock types
type MockRedisClient = {
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
};

type MockApiClient = {
  getActiveAwards: ReturnType<typeof vi.fn>;
  getAward: ReturnType<typeof vi.fn>;
  getCurrentRates: ReturnType<typeof vi.fn>;
  getRatesForDate: ReturnType<typeof vi.fn>;
  getClassifications: ReturnType<typeof vi.fn>;
  getClassificationHierarchy: ReturnType<typeof vi.fn>;
  getRateTemplates: ReturnType<typeof vi.fn>;
  validateRate: ReturnType<typeof vi.fn>;
  calculateBaseRate: ReturnType<typeof vi.fn>;
};

// Mock dependencies with proper types
const mockApiClient: MockApiClient = {
  getActiveAwards: vi.fn(),
  getAward: vi.fn(),
  getCurrentRates: vi.fn(),
  getRatesForDate: vi.fn(),
  getClassifications: vi.fn(),
  getClassificationHierarchy: vi.fn(),
  getRateTemplates: vi.fn(),
  validateRate: vi.fn(),
  calculateBaseRate: vi.fn(),
};

const mockRedisClient: MockRedisClient = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

const mockPrisma: PrismaClient = {} as PrismaClient;
const mockMetrics: MetricsService = {
  recordServiceMethodDuration: vi.fn(),
};

describe('FairWorkService', () => {
  const service = new FairWorkServiceImpl(
    mockApiClient as unknown as FairWorkApiClient,
    mockRedisClient as unknown as RedisClientType,
    {
      prisma: mockPrisma,
      metrics: mockMetrics
    }
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveAwards', () => {
    const mockAwards: Award[] = [
      {
        code: 'MA000001',
        name: 'Award 1',
        effectiveFrom: '2024-01-01',
        classifications: [],
      },
    ];

    it('should return cached awards if available', async () => {
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockAwards));

      const result = await service.getActiveAwards();

      expect(result).toEqual(mockAwards);
      expect(mockRedisClient.get).toHaveBeenCalledWith('active_awards');
      expect(mockApiClient.getActiveAwards).not.toHaveBeenCalled();
    });

    it('should fetch and cache awards if not cached', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getActiveAwards.mockResolvedValueOnce({ items: mockAwards });

      const result = await service.getActiveAwards();

      expect(result).toEqual(mockAwards);
      expect(mockRedisClient.get).toHaveBeenCalledWith('active_awards');
      expect(mockApiClient.getActiveAwards).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'active_awards',
        JSON.stringify(mockAwards),
        expect.any(Number)
      );
    });

    it('should handle errors gracefully', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getActiveAwards.mockRejectedValueOnce(new Error('API error'));

      await expect(service.getActiveAwards()).rejects.toThrow('API error');
    });
  });

  describe('getCurrentRates', () => {
    const mockRates: Rate[] = [
      {
        baseRate: 20.5,
        effectiveFrom: '2024-01-01',
      },
    ];

    it('should return cached rates if available', async () => {
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockRates));

      const result = await service.getCurrentRates('MA000001');

      expect(result).toEqual(mockRates);
      expect(mockRedisClient.get).toHaveBeenCalledWith('rates:MA000001:current');
      expect(mockApiClient.getCurrentRates).not.toHaveBeenCalled();
    });

    it('should fetch and cache rates if not cached', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getCurrentRates.mockResolvedValueOnce(mockRates);

      const result = await service.getCurrentRates('MA000001');

      expect(result).toEqual(mockRates);
      expect(mockRedisClient.get).toHaveBeenCalledWith('rates:MA000001:current');
      expect(mockApiClient.getCurrentRates).toHaveBeenCalledWith('MA000001');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'rates:MA000001:current',
        JSON.stringify(mockRates),
        expect.any(Number)
      );
    });

    it('should handle errors gracefully', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getCurrentRates.mockRejectedValueOnce(new Error('API error'));

      await expect(service.getCurrentRates('MA000001')).rejects.toThrow('API error');
    });
  });

  describe('calculateBaseRate', () => {
    const mockParams = {
      awardCode: 'MA000001',
      classification: 'L1',
    };

    const mockResult = {
      baseRate: 25.5,
    };

    it('should return cached result if available', async () => {
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockResult));

      const result = await service.calculateBaseRate(mockParams);

      expect(result).toEqual(mockResult);
      expect(mockRedisClient.get).toHaveBeenCalledWith(
        expect.stringContaining('rate:base:')
      );
      expect(mockApiClient.calculateBaseRate).not.toHaveBeenCalled();
    });

    it('should fetch and cache result if not cached', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.calculateBaseRate.mockResolvedValueOnce(mockResult);

      const result = await service.calculateBaseRate(mockParams);

      expect(result).toEqual(mockResult);
      expect(mockApiClient.calculateBaseRate).toHaveBeenCalledWith(mockParams);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        expect.stringContaining('rate:base:'),
        JSON.stringify(mockResult),
        expect.any(Number)
      );
    });

    it('should throw error on API failure', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.calculateBaseRate.mockRejectedValueOnce(new Error('API error'));

      await expect(service.calculateBaseRate(mockParams)).rejects.toThrow('API error');
    });
  });
});
