import type { NextApiRequest, NextApiResponse } from 'next';

import { withRateLimit } from '@/lib/middleware/api-rate-limit';
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { logger } from '@/lib/services/logger';
import { RateManagementService } from '@/lib/services/rates/rate-management-service';
import type { RateTemplateInput, RateValidationResult } from '@/lib/types/rates';
import { ApiError } from '@/lib/utils/error';

async function validateRequestBody(body: unknown): Promise<RateTemplateInput> {
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
  ] as const;

  const bodyObj = body as Record<string, unknown>;

  for (const field of requiredFields) {
    if (!(field in bodyObj)) {
      throw new ApiError({
        message: `Missing required field: ${field}`,
        code: 'INVALID_REQUEST',
        statusCode: 400,
      });
    }
  }

  if (
    typeof bodyObj.templateType !== 'string' ||
    !['hourly', 'daily', 'fixed'].includes(bodyObj.templateType)
  ) {
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
  ] as const;

  for (const field of numericFields) {
    if (
      field in bodyObj &&
      (typeof bodyObj[field] !== 'number' || isNaN(bodyObj[field] as number))
    ) {
      throw new ApiError({
        message: `Invalid ${field}: must be a number`,
        code: 'INVALID_REQUEST',
        statusCode: 400,
      });
    }
  }

  // Validate date fields
  try {
    new Date(bodyObj.effectiveFrom as string);
    if (bodyObj.effectiveTo) {
      new Date(bodyObj.effectiveTo as string);
    }
  } catch (error) {
    throw new ApiError({
      message: 'Invalid date format',
      code: 'INVALID_REQUEST',
      statusCode: 400,
    });
  }

  // Validate all required fields are present with correct types
  const template: RateTemplateInput = {
    orgId: String(bodyObj.orgId),
    name: String(bodyObj.name),
    templateType: bodyObj.templateType as RateTemplateInput['templateType'],
    description: bodyObj.description ? String(bodyObj.description) : null,
    baseRate: Number(bodyObj.baseRate),
    baseMargin: Number(bodyObj.baseMargin),
    superRate: Number(bodyObj.superRate),
    leaveLoading: bodyObj.leaveLoading ? Number(bodyObj.leaveLoading) : 0,
    workersCompRate: bodyObj.workersCompRate ? Number(bodyObj.workersCompRate) : 0,
    payrollTaxRate: bodyObj.payrollTaxRate ? Number(bodyObj.payrollTaxRate) : 0,
    trainingCostRate: bodyObj.trainingCostRate ? Number(bodyObj.trainingCostRate) : 0,
    otherCostsRate: bodyObj.otherCostsRate ? Number(bodyObj.otherCostsRate) : 0,
    fundingOffset: bodyObj.fundingOffset ? Number(bodyObj.fundingOffset) : 0,
    casualLoading: bodyObj.casualLoading ? Number(bodyObj.casualLoading) : 0,
    effectiveFrom: String(bodyObj.effectiveFrom),
    effectiveTo: bodyObj.effectiveTo ? String(bodyObj.effectiveTo) : null,
    status: 'draft',
    createdBy: '', // These should be set from the authenticated user
    updatedBy: '', // These should be set from the authenticated user
  };

  return template;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
      (logError as unknown as { code: string }).code = error.code;
    } else {
      (logError as unknown as { code: string }).code = 'UNKNOWN_ERROR';
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
};

export default withRateLimit(handler);

export const config = {
  api: {
    bodyParser: true,
  },
};
