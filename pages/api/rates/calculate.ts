// Core
import { type NextApiRequest, type NextApiResponse } from 'next';
import { z } from 'zod';

// Implementation
import { createLogger } from '@/lib/services/logger';
import { RateManagementServiceImpl } from '@/lib/services/rates/rate-management-service';

// Types
import type { ApiResponse } from '@/lib/types/api';
import type {
  RateTemplate,
  RateCalculationResponse,
  RateValidationResult,
} from '@/lib/types/rates';

// Constants
const ERRORS = {
  INVALID_REQUEST: 'Invalid request body',
  VALIDATION_FAILED: 'Rate validation failed',
  CALCULATION_FAILED: 'Rate calculation failed',
} as const;

interface ErrorLog {
  message: string;
  details?: unknown;
}

interface CalculateRequestBody {
  orgId: string;
  name: string;
  templateType: string;
  baseRate: number;
  baseMargin: number;
  superRate: number;
  effectiveFrom: string;
  awardCode?: string;
  classificationCode?: string;
  hours: number;
  date: string;
}

const logger = createLogger('RateCalculationAPI');

const calculateRequestBodySchema = z.object({
  orgId: z.string(),
  name: z.string(),
  templateType: z.string(),
  baseRate: z.number().positive(),
  baseMargin: z.number().positive(),
  superRate: z.number().positive(),
  effectiveFrom: z.string(),
  awardCode: z.string().optional(),
  classificationCode: z.string().optional(),
  hours: z.number().positive(),
  date: z.string(),
});

const rateService = new RateManagementServiceImpl({
  baseUrl: process.env.RATE_SERVICE_URL ?? 'http://localhost:4000',
  apiKey: process.env.RATE_SERVICE_KEY ?? '',
});

/**
 * POST /api/rates/calculate
 * Calculates rates based on template and parameters
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<RateCalculationResponse>>,
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405: unknown).json({ error: 'Method not allowed' });
  }

  try {
    const parsedBody = calculateRequestBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400: unknown).json({
        error: parsedBody.error.issues.map((issue: unknown) => issue.message).join(', '),
      });
    }

    const body = parsedBody.data;

    // Create rate template from request
    const template: RateTemplate = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validationResult = await rateService.validateRateTemplate(template: unknown);

    if (!validationResult.isValid) {
      return res.status(400: unknown).json({
        error: validationResult.error ?? 'Invalid rate template',
      });
    }

    const result = await rateService.calculateRate(template: unknown);

    return res.status(200: unknown).json({
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to calculate rate', { error });
    return res.status(500: unknown).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
