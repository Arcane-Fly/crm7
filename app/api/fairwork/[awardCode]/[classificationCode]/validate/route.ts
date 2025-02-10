import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
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

export async function POST(request: NextRequest, context: { params: Record<string, string> }) {
  try {
    const body = await request.json();
    const { rate, date, penalties, allowances } = validateRateSchema.parse(body);
    const { awardCode, classificationCode } = context.params;

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
    logger.error('Error validating pay rate', { error });
    if (error instanceof z.ZodError) {
      return createErrorResponse('INVALID_INPUT', 'Invalid input data', error.errors, 400);
    }
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An error occurred while validating the pay rate',
      undefined,
      500
    );
  }
}
