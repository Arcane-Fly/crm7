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

    const rates = await fairworkClient.getRates(
      params.awardCode,
      params.classificationCode,
      date ? { date } : undefined
    );

    return createApiResponse(rates);
  } catch (error) {
    logger.error('Failed to fetch rates', { error });
    return createErrorResponse('RATES_FETCH_ERROR', 'Failed to fetch rates', undefined, 500);
  }
}
