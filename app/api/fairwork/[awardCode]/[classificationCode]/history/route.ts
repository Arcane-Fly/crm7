import { NextRequest, NextResponse } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const fairworkClient = new FairWorkClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date') ?? undefined;
    const options = date ? { date } : {};
    const rates = await fairworkClient.getRateHistory(
      params.awardCode,
      params.classificationCode,
      options
    );
    return createApiResponse(rates);
  } catch (error) {
    logger.error('Failed to fetch rate history', { error });
    return createErrorResponse('RATE_HISTORY_FETCH_ERROR', 'Failed to fetch rate history', undefined, 500);
  }
}
