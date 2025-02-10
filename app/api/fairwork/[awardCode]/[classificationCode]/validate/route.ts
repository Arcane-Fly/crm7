import { createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import type { FairWorkEnvironment } from '@/lib/services/fairwork/types';
import { NextRequest, NextResponse } from 'next/server';

const fairworkClient = new FairWorkClient({
  apiUrl: process.env.FAIRWORK_API_URL!,
  apiKey: process.env.FAIRWORK_API_KEY!,
  environment: process.env.FAIRWORK_ENVIRONMENT as FairWorkEnvironment,
});

export async function POST(req: NextRequest) {
  try {
    const [, , , awardCode, classificationCode] = req.nextUrl.pathname.split('/');
    if (!awardCode || !classificationCode) {
      return createErrorResponse('MISSING_PARAMS', 'Missing required parameters', undefined, 400);
    }

    const { rate, date, penalties, allowances } = await req.json();
    if (rate === undefined) {
      return createErrorResponse('MISSING_RATE', 'Rate is required', undefined, 400);
    }

    const validation = await fairworkClient.validatePayRate(awardCode, classificationCode, {
      rate,
      date,
      penalties,
      allowances,
    });

    return NextResponse.json(validation);
  } catch (err) {
    logger.error('Failed to validate rate', { err });
    return createErrorResponse('RATE_VALIDATION_ERROR', 'Failed to validate rate', undefined, 500);
  }
}
