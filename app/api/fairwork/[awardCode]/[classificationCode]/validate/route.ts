import { NextRequest } from 'next/server';
import { createApiResponse, createErrorResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';

const fairworkClient = new FairWorkClient({
  apiUrl: process.env.FAIRWORK_API_URL!,
  apiKey: process.env.FAIRWORK_API_KEY!,
  environment: process.env.FAIRWORK_ENVIRONMENT!,
});

export interface RouteParams {
  params: {
    awardCode: string;
    classificationCode: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { awardCode, classificationCode } = params;
    if (!awardCode || !classificationCode) {
      return createErrorResponse(
        'MISSING_PARAMS',
        'Missing required parameters',
        undefined,
        400
      );
    }

    const data = await request.json();
    const validation = await fairworkClient.validatePayRate(awardCode, classificationCode, data);
    return createApiResponse(validation);
  } catch (error) {
    return createErrorResponse(
      'VALIDATION_ERROR',
      'Failed to validate pay rate',
      undefined,
      500
    );
  }
}
