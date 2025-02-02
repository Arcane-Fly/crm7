import { describe, expect, it, vi } from 'vitest';
import { type RedisClientType } from 'redis';
import { FairWorkServiceImpl } from '../fairwork-service';
import { type FairWorkApiClient } from '../api-client';
import { type Award, type Rate } from '../types';

// Mock dependencies
const mockApiClient = {
  getActiveAwards: vi.fn(),
  getAward: vi.fn(),
  getCurrentRates: vi.fn(),
  getRatesForDate: vi.fn(),
  getClassifications: vi.fn(),
  getClassificationHierarchy: vi.fn(),
  getRateTemplates: vi.fn(),
  validateRate: vi.fn(),
  calculateBaseRate: vi.fn(),
} as unknown as FairWorkApiClient;

const mockRedisClient = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
} as unknown as RedisClientType;

describe('FairWorkService', () => {
  const service = new FairWorkServiceImpl(mockApiClient, mockRedisClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActiveAwards', () => {
    const mockAwards: Award[] = [
      {
        code: 'MA000001',
        title: 'Award 1',
        status: 'active',
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
      mockApiClient.getActiveAwards.mockResolvedValueOnce(mockAwards);

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

      const result = await service.getActiveAwards();

      expect(result).toEqual([]);
    });
  });

  describe('getCurrentRates', () => {
    const mockRates: Rate[] = [
      {
        code: 'RATE1',
        amount: 20.5,
        effectiveFrom: '2024-01-01',
        status: 'active',
      },
    ];

    it('should return cached rates if available', async () => {
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockRates));

      const result = await service.getCurrentRates('MA000001');

      expect(result).toEqual(mockRates);
      expect(mockRedisClient.get).toHaveBeenCalledWith('rates:current:MA000001');
      expect(mockApiClient.getCurrentRates).not.toHaveBeenCalled();
    });

    it('should fetch and cache rates if not cached', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getCurrentRates.mockResolvedValueOnce({ items: mockRates });

      const result = await service.getCurrentRates('MA000001');

      expect(result).toEqual(mockRates);
      expect(mockRedisClient.get).toHaveBeenCalledWith('rates:current:MA000001');
      expect(mockApiClient.getCurrentRates).toHaveBeenCalledWith('MA000001');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'rates:current:MA000001',
        JSON.stringify(mockRates),
        expect.any(Number)
      );
    });

    it('should handle errors gracefully', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getCurrentRates.mockRejectedValueOnce(new Error('API error'));

      const result = await service.getCurrentRates('MA000001');

      expect(result).toEqual([]);
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
