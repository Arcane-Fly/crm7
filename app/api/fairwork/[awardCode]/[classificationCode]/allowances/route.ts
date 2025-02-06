import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getAllowances } from '@/lib/services/fairwork/allowances';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { awardCode, classificationCode } = req.query;

  try {
    const allowances = await getAllowances(awardCode, classificationCode);
    return createApiResponse({
      allowances,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get allowances', { error });
    return createErrorResponse('ALLOWANCES_FETCH_ERROR', 'Failed to get allowances', undefined, 500);
  }
}
