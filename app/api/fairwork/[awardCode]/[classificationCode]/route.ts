import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';

export async function GET(req: NextRequest, { params }: { params: { awardCode: string; classificationCode: string } }): Promise<NextResponse> {
  const { awardCode, classificationCode } = params;
  const client = new FairWorkClient({
    apiUrl: process.env.FAIRWORK_API_URL,
    apiKey: process.env.FAIRWORK_API_KEY,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  });

  try {
    const classification = await client.getClassification(awardCode, classificationCode);
    return createApiResponse({
      classification,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get classification', { error, awardCode, classificationCode });
    return createErrorResponse('CLASSIFICATION_FETCH_ERROR', 'Failed to get classification', undefined, 500);
  }
}
