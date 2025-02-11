import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { NextRequest } from 'next/server';
import type { FairWorkEnvironment } from '@/lib/services/fairwork/types';

const fairworkClient = new FairWorkClient({
  apiUrl: process.env.FAIRWORK_API_URL!,
  apiKey: process.env.FAIRWORK_API_KEY!,
  environment: process.env.FAIRWORK_ENVIRONMENT as FairWorkEnvironment,
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ awardCode: string; classificationCode: string }> }
) {
  try {
    const { awardCode, classificationCode } = await context.params;
    if (!awardCode || !classificationCode) {
      return createErrorResponse(
        'MISSING_PARAMS',
        'Missing required parameters: awardCode and classificationCode',
        undefined,
        400
      );
    }

    const url = new URL(request.url);
    const query: { date?: string; employmentType?: string } = {
      date: url.searchParams.get('date') || undefined,
      employmentType: url.searchParams.get('employmentType') || undefined,
    };

    const rates = await fairworkClient.getRates(awardCode, classificationCode, query);
    return createApiResponse(rates);
  } catch (error) {
    logger.error('Failed to fetch rates', { error });
    return createErrorResponse('RATES_FETCH_ERROR', 'Failed to fetch rates', undefined, 500);
  }
}
