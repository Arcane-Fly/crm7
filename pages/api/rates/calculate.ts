import { ApiError } from '@/lib/utils/error';
import { withRateLimit } from '@/lib/middleware/api-rate-limit';
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { logger } from '@/lib/services/logger';
import { RateManagementService } from '@/lib/services/rates/rate-management-service';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { RateTemplateInput, RateValidationResult } from '@/lib/types/rates';

async function validateRequestBody(body: any): Promise<RateTemplateInput> {
  if (!body || typeof body !== 'object') {
    throw new ApiError({
      message: 'Invalid request body',
      code: 'INVALID_REQUEST',
      statusCode: 400,
    });
  }

  const requiredFields = [
    'orgId',
    'name',
    'templateType',
    'baseRate',
    'baseMargin',
    'superRate',
    'effectiveFrom',
  ];

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new ApiError({
        message: `Missing required field: ${field}`,
        code: 'INVALID_REQUEST',
        statusCode: 400,
      });
    }
  }

  if (!['hourly', 'daily', 'fixed'].includes(body.templateType)) {
    throw new ApiError({
      message: 'Invalid template type',
      code: 'INVALID_REQUEST',
      statusCode: 400,
    });
  }

  // Validate numeric fields
  const numericFields = [
    'baseRate',
    'baseMargin',
    'superRate',
    'leaveLoading',
    'workersCompRate',
    'payrollTaxRate',
    'trainingCostRate',
    'otherCostsRate',
    'fundingOffset',
    'casualLoading',
  ];

  for (const field of numericFields) {
    if (field in body && (typeof body[field] !== 'number' || isNaN(body[field]))) {
      throw new ApiError({
        message: `Invalid ${field}: must be a number`,
        code: 'INVALID_REQUEST',
        statusCode: 400,
      });
    }
  }

  // Validate date fields
  try {
    new Date(body.effectiveFrom);
    if (body.effectiveTo) {
      new Date(body.effectiveTo);
    }
  } catch (error) {
    throw new ApiError({
      message: 'Invalid date format',
      code: 'INVALID_REQUEST',
      statusCode: 400,
    });
  }

  return body as RateTemplateInput;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const template = await validateRequestBody(req.body);

    const rateService = new RateManagementService();
    const fairWorkService = new FairWorkService();

    // Validate against Fair Work rates
    const validationResult: RateValidationResult = await rateService.validateRateTemplate(template);

    if (!validationResult.isValid) {
      return res.status(400).json({
        error: 'Rate validation failed',
        code: 'VALIDATION_ERROR',
        details: {
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        },
      });
    }

    // Calculate rate
    const calculatedRate = await rateService.calculateRate(template);

    // Additional Fair Work compliance check if award details are provided
    if (template.awardCode && template.classificationCode) {
      const fairWorkValidation = await fairWorkService.validateRate({
        rate: calculatedRate,
        awardCode: template.awardCode,
        classificationCode: template.classificationCode,
        date: new Date(template.effectiveFrom),
      });

      if (!fairWorkValidation.isValid) {
        return res.status(400).json({
          error: 'Fair Work compliance check failed',
          code: 'COMPLIANCE_ERROR',
          details: fairWorkValidation,
        });
      }

      return res.status(200).json({
        rate: calculatedRate,
        validation: validationResult,
        fairWorkValidation,
      });
    }

    // Return calculated rate without Fair Work validation if no award details
    return res.status(200).json({
      rate: calculatedRate,
      validation: validationResult,
    });
  } catch (error) {
    const logError = new Error(error instanceof Error ? error.message : 'Unknown error');
    logError.name = 'RateCalculationError';
    if (error instanceof Error) {
      logError.stack = error.stack;
    }
    if (error instanceof ApiError) {
      (logError as any).code = error.code;
    } else {
      (logError as any).code = 'UNKNOWN_ERROR';
    }

    logger.error('Rate calculation failed:', logError);

    if (error instanceof ApiError) {
      return res.status(error.statusCode || 500).json({
        error: error.message,
        code: error.code,
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export default withRateLimit(handler);
