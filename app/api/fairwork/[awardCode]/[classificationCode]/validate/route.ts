import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { NextRequest, NextResponse } from 'next/server';

const fairworkClient = new FairWorkClient();

export async function POST(
  req: NextRequest,
  context: { params: { awardCode: string; classificationCode: string } }
): Promise<NextResponse> {
  try {
    const body = await req.json();
    // Use validatePayRate with awardCode and classificationCode from the URL params
    const validationResult = await fairworkClient.validatePayRate(
      context.params.awardCode,
      context.params.classificationCode,
      body
    );
    return createApiResponse(validationResult);
  } catch (error) {
    return createErrorResponse(
      'VALIDATION_ERROR',
      'Rate validation failed',
      undefined,
      500
    );
  }
}
