import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { NextRequest, NextResponse } from 'next/server';

const fairworkClient = new FairWorkClient();

export async function GET(
  req: NextRequest,
  context: { params: { awardCode: string; classificationCode: string } }
): Promise<NextResponse> {
  try {
    // Only pass the awardCode and query parameters (omit classificationCode)
    const url = new URL(req.url);
    const query: { date?: string; employmentType?: string } = {
      date: url.searchParams.get('date') || undefined,
      employmentType: url.searchParams.get('employmentType') || undefined,
    };
    const entitlements = await fairworkClient.getLeaveEntitlements(
      context.params.awardCode,
      query
    );
    return createApiResponse(entitlements);
  } catch (_error) {
    return createErrorResponse(
      'LEAVE_ENTITLEMENTS_FETCH_ERROR',
      'Failed to fetch leave entitlements',
      undefined,
      500
    );
  }
}
