import { mock } from 'jest-mock-extended';
import type { RedisClientType } from 'redis';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FairWorkApiClient } from '../api-client';
import { FairWorkService } from '../fairwork-service';
import type { Award, Classification, PayRate } from '../types';

describe('FairWorkService', () => {
  const mockApiClient = mock<FairWorkApiClient>();
  const mockRedisClient = mock<RedisClientType>();
  const mockMetrics = { recordServiceMethodDuration: vi.fn() };

  let service: FairWorkService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FairWorkService({
      apiClient: mockApiClient,
      redis: mockRedisClient,
      metrics: mockMetrics,
    });
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
      mockApiClient.getActiveAwards.mockResolvedValueOnce(mockAwards);

      const result = await service.getActiveAwards();

      expect(result).toEqual(mockAwards);
      expect(mockRedisClient.get).toHaveBeenCalledWith('active_awards');
      expect(mockApiClient.getActiveAwards).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'active_awards',
        JSON.stringify(mockAwards),
        { EX: 3600 }
      );
    });

    it('should handle API errors', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getActiveAwards.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getActiveAwards()).rejects.toThrow('API Error');
    });
  });

  describe('getCurrentRates', () => {
    const mockRates: PayRate[] = [
      {
        baseRate: 20.5,
        effectiveFrom: '2024-01-01',
        penalties: [],
        allowances: [],
      },
    ];

    it('should return cached rates if available', async () => {
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockRates));

      const result = await service.getCurrentRates();

      expect(result).toEqual(mockRates);
      expect(mockRedisClient.get).toHaveBeenCalledWith('current_rates');
      expect(mockApiClient.getCurrentRates).not.toHaveBeenCalled();
    });

    it('should fetch and cache rates if not cached', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);
      mockApiClient.getCurrentRates.mockResolvedValueOnce(mockRates);

      const result = await service.getCurrentRates();

      expect(result).toEqual(mockRates);
      expect(mockRedisClient.get).toHaveBeenCalledWith('current_rates');
      expect(mockApiClient.getCurrentRates).toHaveBeenCalled();
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'current_rates',
        JSON.stringify(mockRates),
        { EX: 3600 }
      );
    });
  });

  describe('getClassifications', () => {
    const mockClassifications: Classification[] = [
      {
        code: 'L1',
        name: 'Level 1',
        level: '1',
        baseRate: 25.0,
        effectiveFrom: '2024-01-01',
      },
    ];

    it('should fetch classifications', async () => {
      mockApiClient.getClassifications.mockResolvedValueOnce(mockClassifications);

      const result = await service.getClassifications();

      expect(result).toEqual(mockClassifications);
      expect(mockApiClient.getClassifications).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      mockApiClient.getClassifications.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getClassifications()).rejects.toThrow('API Error');
    });
  });
});
