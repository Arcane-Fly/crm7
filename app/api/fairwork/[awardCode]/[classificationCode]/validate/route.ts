import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { FairWorkClient, FairWorkApiError } from '@/lib/services/fairwork/fairwork-client';
import type { FairWorkEnvironment } from '@/lib/services/fairwork/types';

const fairworkClient = new FairWorkClient({
  apiUrl: process.env.FAIRWORK_API_URL,
  apiKey: process.env.FAIRWORK_API_KEY,
  environment: process.env.FAIRWORK_ENVIRONMENT as FairWorkEnvironment,
});

const validateRateSchema = z.object({
  rate: z.number().positive(),
  date: z.string().optional(),
  penalties: z.array(z.string()).optional(),
  allowances: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logger.error('Error parsing request body', { error });
      return createErrorResponse('INVALID_INPUT', 'Invalid JSON in request body', undefined, 400);
    }

    const validationResult = validateRateSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        'INVALID_INPUT',
        'Invalid input data',
        validationResult.error.errors,
        400
      );
    }

    const { rate, date, penalties, allowances } = validationResult.data;
    const { awardCode, classificationCode } = params;

    try {
      const validation = await fairworkClient.validatePayRate(awardCode, classificationCode, {
        rate,
        awardCode,
        classificationCode,
        date,
        penalties,
        allowances,
      });

      return NextResponse.json(validation);
    } catch (error) {
      logger.error('Error from FairWork API', {
        error,
        params: { awardCode, classificationCode, rate },
      });

      if (error instanceof FairWorkApiError) {
        return NextResponse.json(
          {
            error: error.message,
            details: error.context,
          },
          { status: error.statusCode }
        );
      }

      return NextResponse.json(
        {
          error: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Unexpected error in validate route', { error });
    return createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred', undefined, 500);
  }
}
