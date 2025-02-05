import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { NextRequest, NextResponse } from 'next/server';

const fairworkClient = new FairWorkClient();

export async function GET(
  _req: NextRequest,  // renamed to _req since it is not used
  context: { params: { awardCode: string; classificationCode: string } }
): Promise<NextResponse> {
  try {
    const classification = await fairworkClient.getClassification(
      context.params.awardCode,
      context.params.classificationCode
    );
    return createApiResponse(classification);
  } catch (_error) {
    return createErrorResponse(
      'CLASSIFICATION_FETCH_ERROR',
      'Failed to fetch classification',
      undefined,
      500
    );
  }
}
