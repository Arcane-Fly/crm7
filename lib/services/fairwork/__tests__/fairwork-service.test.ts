import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FairWorkService } from '../fairwork-service';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

// Mock dependencies
vi.mock('@/lib/supabase/client');
vi.mock('@/lib/logger');

const mockConfig = {
  apiKey: 'test-api-key',
  apiUrl: 'https://api.test.com',
  environment: 'sandbox' as const,
  timeout: 5000,
  retryAttempts: 3,
};

describe('FairWorkService', () => {
  let service: FairWorkService;
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      rpc: vi.fn(),
    };
    (createClient as any).mockReturnValue(mockSupabase);

    // Create service instance
    service = new FairWorkService(mockConfig);
  });

  describe('getBaseRate', () => {
    it('should return base rate for valid parameters', async () => {
      const params = {
        awardCode: 'MA000001',
        classificationCode: 'L1',
        date: new Date('2025-01-01'),
      };

      const expectedRate = 25.5;
      mockSupabase.rpc.mockResolvedValue({ data: expectedRate, error: null });

      const result = await service.getBaseRate(params);
      expect(result).toBe(expectedRate);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_award_base_rate', params);
    });

    it('should throw error when Supabase call fails', async () => {
      const error = new Error('Database error');
      mockSupabase.rpc.mockResolvedValue({ data: null, error });

      await expect(service.getBaseRate({
        awardCode: 'MA000001',
        classificationCode: 'L1',
        date: new Date('2025-01-01'),
      })).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getAwardRate', () => {
    it('should return full award rate details', async () => {
      const params = {
        awardCode: 'MA000001',
        classificationCode: 'L1',
        date: new Date('2025-01-01'),
      };

      const expectedRate = {
        baseRate: 25.5,
        casualLoading: 25,
        penalties: [
          { code: 'SAT', rate: 25, description: 'Saturday penalty' },
        ],
        allowances: [
          { code: 'TOOL', amount: 15.5, description: 'Tool allowance' },
        ],
      };

      mockSupabase.rpc.mockResolvedValue({ data: expectedRate, error: null });

      const result = await service.getAwardRate(params);
      expect(result).toEqual(expectedRate);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_award_rate', params);
    });
  });

  describe('getClassifications', () => {
    it('should return classifications list', async () => {
      const params = {
        awardCode: 'MA000001',
        searchTerm: 'Level 1',
      };

      const expectedClassifications = [
        {
          code: 'L1',
          name: 'Level 1',
          level: '1',
          validFrom: '2025-01-01',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: expectedClassifications, error: null });

      const result = await service.getClassifications(params);
      expect(result).toEqual(expectedClassifications);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_award_classifications', params);
    });
  });

  describe('calculateRate', () => {
    it('should calculate pay rate with all components', async () => {
      const params = {
        awardCode: 'MA000001',
        classificationCode: 'L1',
        employmentType: 'casual' as const,
        date: new Date('2025-01-01'),
        penalties: ['SAT'],
        allowances: ['TOOL'],
      };

      const expectedCalculation = {
        baseRate: 25.5,
        casualLoading: 25,
        penalties: [
          { code: 'SAT', rate: 25, amount: 6.375, description: 'Saturday penalty' },
        ],
        allowances: [
          { code: 'TOOL', amount: 15.5, description: 'Tool allowance' },
        ],
        total: 47.375,
        breakdown: {
          base: 25.5,
          loading: 6.375,
          penalties: 6.375,
          allowances: 15.5,
        },
      };

      mockSupabase.rpc.mockResolvedValue({ data: expectedCalculation, error: null });

      const result = await service.calculateRate(params);
      expect(result).toEqual(expectedCalculation);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('calculate_award_rate', params);
    });
  });

  describe('validateRate', () => {
    it('should validate pay rate against award minimum', async () => {
      const params = {
        awardCode: 'MA000001',
        classificationCode: 'L1',
        rate: 30,
        date: new Date('2025-01-01'),
      };

      const expectedValidation = {
        isValid: true,
        minimumRate: 25.5,
        difference: 4.5,
      };

      mockSupabase.rpc.mockResolvedValue({ data: expectedValidation, error: null });

      const result = await service.validateRate(params);
      expect(result).toEqual(expectedValidation);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('validate_award_rate', params);
    });
  });

  describe('getRateHistory', () => {
    it('should return historical rates', async () => {
      const params = {
        awardCode: 'MA000001',
        classificationCode: 'L1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01'),
      };

      const expectedHistory = [
        {
          baseRate: 25.5,
          effectiveFrom: '2025-01-01',
        },
        {
          baseRate: 24.5,
          effectiveFrom: '2024-07-01',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: expectedHistory, error: null });

      const result = await service.getRateHistory(params);
      expect(result).toEqual(expectedHistory);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_award_rate_history', params);
    });
  });

  describe('getFutureRates', () => {
    it('should return future scheduled rates', async () => {
      const params = {
        awardCode: 'MA000001',
        classificationCode: 'L1',
        fromDate: new Date('2025-01-01'),
      };

      const expectedRates = [
        {
          baseRate: 26.5,
          effectiveFrom: '2025-07-01',
        },
      ];

      mockSupabase.rpc.mockResolvedValue({ data: expectedRates, error: null });

      const result = await service.getFutureRates(params);
      expect(result).toEqual(expectedRates);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_future_award_rates', params);
    });
  });
});
