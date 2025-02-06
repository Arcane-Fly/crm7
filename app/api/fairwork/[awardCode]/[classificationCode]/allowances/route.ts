import { NextRequest, NextResponse } from 'next/server';
import { getAllowances } from '@/lib/services/fairwork/allowances';
import { logger } from '@/lib/logger';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';

export async function GET(
  req: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
): Promise<NextResponse> {
  try {
    const { awardCode, classificationCode } = params;
    if (!awardCode || !classificationCode) {
      return createErrorResponse(
        'MISSING_PARAMS',
        'Missing required parameters: awardCode and classificationCode',
        undefined,
        400
      );
    }

    const allowances = await getAllowances(awardCode, classificationCode);
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
