import { NextRequest, NextResponse } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';

const fairworkClient = new FairWorkClient(defaultConfig);

export async function GET(
  req: NextRequest,
  { params }: { params: { awardCode: string } }
): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date') ?? undefined;
    const query = date ? { date } : undefined;
    const entitlements = await fairworkClient.getLeaveEntitlements(
      params.awardCode,
      query
    );
    return createApiResponse(entitlements);
  } catch (error) {
    logger.error('Failed to fetch leave entitlements', { error });
    return createErrorResponse('LEAVE_ENTITLEMENTS_FETCH_ERROR', 'Failed to fetch leave entitlements', undefined, 500);
  }
}
