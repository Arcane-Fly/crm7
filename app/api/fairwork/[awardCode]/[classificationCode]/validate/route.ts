import { NextRequest, NextResponse } from 'next/server';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';

const fairworkClient = new FairWorkClient();

export async function POST(
  req: NextRequest,
  { params: _params }: { params: { awardCode: string; classificationCode: string } }
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validationResult = await fairworkClient.validateRate(body);
    return createApiResponse(validationResult);
  } catch (error) {
    logger.error('Failed to validate rate', { error });
    return createErrorResponse('RATE_VALIDATION_FAILED', 'Failed to validate rate', undefined, 500);
  }
}
