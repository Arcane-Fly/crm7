import type { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

import { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { logger } from '@/lib/services/logger';
import { RateManagementService } from '@/lib/services/rates/rate-management-service';
import { ApiError } from '@/lib/utils/error';

import calculateHandler from '../calculate';

jest.mock('@/lib/services/rates/rate-management-service');
jest.mock('@/lib/services/fairwork/fairwork-service');
jest.mock('@/lib/services/logger');

describe('Rate Calculation API', () => {
  const mockValidTemplate = {
    orgId: 'org123',
    name: 'Test Template',
    templateType: 'hourly',
    baseRate: 25,
    baseMargin: 10,
    superRate: 10.5,
    effectiveFrom: '2025-01-29',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('returns 405 for non-POST requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
      });
    });

    it('validates required fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          // Missing required fields
          orgId: 'org123',
        },
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: expect.stringContaining('Missing required field'),
        code: 'INVALID_REQUEST',
      });
    });

    it('validates numeric fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          ...mockValidTemplate,
          baseRate: 'invalid', // Should be a number
        },
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: expect.stringContaining('must be a number'),
        code: 'INVALID_REQUEST',
      });
    });

    it('validates date fields', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          ...mockValidTemplate,
          effectiveFrom: 'invalid-date',
        },
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: 'Invalid date format',
        code: 'INVALID_REQUEST',
      });
    });
  });

  describe('Rate Calculation', () => {
    it('calculates rates successfully without award details', async () => {
      const mockCalculatedRate = 35.75;

      (RateManagementService.prototype.validateRateTemplate as jest.Mock).mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      (RateManagementService.prototype.calculateRate as jest.Mock).mockResolvedValue(
        mockCalculatedRate,
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidTemplate,
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({
        rate: mockCalculatedRate,
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
        },
      });
    });

    it('validates against Fair Work rates when award details are provided', async () => {
      const mockCalculatedRate = 35.75;
      const templateWithAward = {
        ...mockValidTemplate,
        awardCode: 'TEST001',
        classificationCode: 'L1',
      };

      (RateManagementService.prototype.validateRateTemplate as jest.Mock).mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      (RateManagementService.prototype.calculateRate as jest.Mock).mockResolvedValue(
        mockCalculatedRate,
      );

      (FairWorkService.prototype.validateRate as jest.Mock).mockResolvedValue({
        isValid: true,
        minimumRate: 20,
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: templateWithAward,
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({
        rate: mockCalculatedRate,
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
        },
        fairWorkValidation: {
          isValid: true,
          minimumRate: 20,
        },
      });
    });

    it('handles Fair Work validation failures', async () => {
      const mockCalculatedRate = 15; // Below minimum
      const templateWithAward = {
        ...mockValidTemplate,
        awardCode: 'TEST001',
        classificationCode: 'L1',
        baseRate: 15,
      };

      (RateManagementService.prototype.validateRateTemplate as jest.Mock).mockResolvedValue({
        isValid: true,
        errors: [],
        warnings: [],
      });

      (RateManagementService.prototype.calculateRate as jest.Mock).mockResolvedValue(
        mockCalculatedRate,
      );

      (FairWorkService.prototype.validateRate as jest.Mock).mockResolvedValue({
        isValid: false,
        minimumRate: 20,
        reason: 'Rate is below minimum wage',
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: templateWithAward,
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: 'Fair Work compliance check failed',
        code: 'COMPLIANCE_ERROR',
      });
    });
  });

  describe('Error Handling', () => {
    it('handles service errors gracefully', async () => {
      (RateManagementService.prototype.validateRateTemplate as jest.Mock).mockRejectedValue(
        new Error('Service unavailable'),
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidTemplate,
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
      expect(logger.error).toHaveBeenCalled();
    });

    it('handles API errors with proper status codes', async () => {
      (RateManagementService.prototype.validateRateTemplate as jest.Mock).mockRejectedValue(
        new ApiError({
          message: 'Invalid input',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        }),
      );

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: mockValidTemplate,
      });

      await calculateHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toMatchObject({
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
      });
    });
  });

  describe('Rate Limiting', () => {
    it('applies rate limiting to requests', async () => {
      // Create multiple requests in quick succession
      const requests = Array(150).fill(null).map(() =>
        createMocks<NextApiRequest, NextApiResponse>({
          method: 'POST',
          body: mockValidTemplate,
        }),
      );

      // Execute requests sequentially
      for (const { req, res } of requests) {
        await calculateHandler(req, res);
      }

      // The last few requests should be rate limited
      const lastResponse = requests[requests.length - 1].res;
      expect(lastResponse._getStatusCode()).toBe(429);
      expect(JSON.parse(lastResponse._getData())).toMatchObject({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    });
  });
});
