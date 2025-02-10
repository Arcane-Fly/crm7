import { NextRequest } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import type { FairWorkEnvironment } from '@/lib/services/fairwork/types';

const fairworkClient = new FairWorkClient({
  apiUrl: process.env.FAIRWORK_API_URL!,
  apiKey: process.env.FAIRWORK_API_KEY!,
  environment: process.env.FAIRWORK_ENVIRONMENT as FairWorkEnvironment,
});

export async function GET(req: NextRequest) {
  try {
    const awardCode = req.nextUrl.pathname.split('/')[3];
    if (!awardCode) {
      return createErrorResponse('MISSING_PARAMS', 'Missing award code', undefined, 400);
    }

    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date') ?? undefined;
    const query = date ? { date } : undefined;

    const allowances = await fairworkClient.getAllowances(awardCode, query);
    return createApiResponse(allowances);
  } catch (error) {
    logger.error('Failed to fetch allowances', { error });
    return createErrorResponse(
      'ALLOWANCES_FETCH_ERROR',
      'Failed to fetch allowances',
      undefined,
      500
    );
  }
}
