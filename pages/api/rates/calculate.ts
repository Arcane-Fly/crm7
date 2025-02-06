import { type NextApiRequest, type NextApiResponse } from 'next';
import { z } from 'zod';

import { createLogger } from '@/lib/services/logger';
import { RateManagementServiceImpl } from '@/lib/services/rates/rate-management-service';
import { withApiAuthRequired } from '@auth0/nextjs-auth0/edge';

import type { ApiResponse } from '@/lib/types/api';
import type { RateTemplate, RateCalculationResponse } from '@/lib/types/rates';

export const config = {
  runtime: 'edge',
};

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
export default withApiAuthRequired(async function handler(req: NextApiRequest): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const parsedBody = calculateRequestBodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      return new Response(
        JSON.stringify({
          error: parsedBody.error.issues.map((issue) => issue.message).join(', '),
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = parsedBody.data;

    const template: RateTemplate = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validationResult = await rateService.validateRateTemplate(template);

    if (!validationResult.isValid) {
      return new Response(
        JSON.stringify({
          error: validationResult.error ?? 'Invalid rate template',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await rateService.calculateRate(template);

    return new Response(
      JSON.stringify({
        data: result,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    logger.error('Failed to calculate rate', { error });
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
