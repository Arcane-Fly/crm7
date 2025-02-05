import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { NextRequest, NextResponse } from 'next/server';

const fairworkClient = new FairWorkClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: { awardCode: string } }
): Promise<NextResponse> {
  try {
    // Supply a fallback classification code (e.g. 'default') if one is not provided.
    const result = await fairworkClient.getRates(params.awardCode, 'default');
    if (!result || result.length === 0) {
      return createErrorResponse('AWARD_NOT_FOUND', 'Award not found', undefined, 404);
    }
    const rates = result;
    return createApiResponse({
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return createErrorResponse('AWARD_FETCH_ERROR', 'Failed to fetch award', undefined, 500);
  }
}
