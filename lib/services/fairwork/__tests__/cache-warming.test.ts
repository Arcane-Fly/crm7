import { mock } from 'jest-mock-extended';

import { cacheWarming } from '@/lib/services/cache/warming';

import { FairWorkCacheWarming } from '../cache-warming';
import type { FairWorkService } from '../fairwork-service';
import type { Award } from '../types';

jest.mock('@/lib/services/cache/warming');

describe('FairWorkCacheWarming', () => {
  let mockFairWorkService: jest.Mocked<FairWorkService>;
  let warming: FairWorkCacheWarming;

  const mockAwards: Award[] = [
    {
      code: 'TEST001',
      name: 'Test Award 1',
      effectiveFrom: new Date('2025-01-01'),
    },
    {
      code: 'TEST002',
      name: 'Test Award 2',
      effectiveFrom: new Date('2025-01-01'),
    },
  ];

  beforeEach(() => {
    mockFairWorkService = mock<FairWorkService>();
    mockFairWorkService.getActiveAwards.mockResolvedValue(mockAwards);

    warming = new FairWorkCacheWarming(mockFairWorkService, {
      awardRefreshInterval: 3600000, // 1 hour
      daysAhead: 3,
      priorities: {
        currentRates: 3,
        futureRates: 2,
        classifications: 2,
        templates: 1,
      },
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    warming.stop();
  });

  describe('Initialization', () => {
    it('should register cache entries for current rates', async () => {
      warming.initialize();
      await Promise.resolve(); // Wait for promises to resolve

      expect(cacheWarming.register).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'rates:TEST001:current',
          priority: 3,
          ttl: 3600000,
        }),
      );
    });

    it('should register cache entries for classifications', async () => {
      warming.initialize();
      await Promise.resolve();

      expect(cacheWarming.register).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'classifications:TEST001',
          priority: 2,
          ttl: 3600000,
        }),
      );
    });

    it('should register cache entries for future rates', async () => {
      const today = new Date();
      warming.initialize();
      await Promise.resolve();

      // Should register entries for next 3 days
      for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        expect(cacheWarming.register).toHaveBeenCalledWith(
          expect.objectContaining({
            key: `rates:TEST001:${dateStr}`,
            priority: 2,
            ttl: 3600000,
          }),
        );
      }
    });

    it('should register cache entries for classification hierarchies', async () => {
      warming.initialize();
      await Promise.resolve();

      expect(cacheWarming.register).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'classifications:hierarchy:TEST001',
          priority: 2,
          ttl: 3600000,
        }),
      );
    });

    it('should register cache entries for templates', async () => {
      warming.initialize();
      await Promise.resolve();

      expect(cacheWarming.register).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'templates:TEST001',
          priority: 1,
          ttl: 3600000,
        }),
      );
    });

    it('should start the warming process after registration', async () => {
      warming.initialize();
      await Promise.resolve();

      expect(cacheWarming.start).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should use default config when none provided', () => {
      const defaultWarming = new FairWorkCacheWarming(mockFairWorkService);
      defaultWarming.initialize();

      expect(cacheWarming.register).toHaveBeenCalledWith(
        expect.objectContaining({
          ttl: 24 * 60 * 60 * 1000, // 24 hours
        }),
      );
    });

    it('should merge partial config with defaults', () => {
      const partialWarming = new FairWorkCacheWarming(mockFairWorkService, {
        daysAhead: 5,
        priorities: {
          currentRates: 4, // Override just one priority
        },
      });

      partialWarming.initialize();
      expect(cacheWarming.register).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 4,
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle failed award fetching gracefully', async () => {
      const error = new Error('Failed to fetch awards');
      mockFairWorkService.getActiveAwards.mockRejectedValueOnce(error);

      warming.initialize();
      await Promise.resolve();

      // Should not prevent other operations
      expect(cacheWarming.start).toHaveBeenCalled();
    });

    it('should continue registration if one award fails', async () => {
      mockFairWorkService.getCurrentRates
        .mockRejectedValueOnce(new Error('Failed for TEST001'))
        .mockResolvedValueOnce([]); // Succeed for TEST002

      warming.initialize();
      await Promise.resolve();

      // Should still register cache entries for TEST002
      expect(cacheWarming.register).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'rates:TEST002:current',
        }),
      );
    });
  });

  describe('Cleanup', () => {
    it('should stop warming process when stopped', () => {
      warming.initialize();
      warming.stop();

      expect(cacheWarming.stop).toHaveBeenCalled();
    });

    it('should be safe to stop multiple times', () => {
      warming.stop();
      warming.stop();

      expect(cacheWarming.stop).toHaveBeenCalledTimes(2);
    });
  });
});
