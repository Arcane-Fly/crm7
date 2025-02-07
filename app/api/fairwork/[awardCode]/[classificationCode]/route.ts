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

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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

    const url = new URL(request.url);
    const query: { date?: string; employmentType?: string } = {
      date: url.searchParams.get('date') || undefined,
      employmentType: url.searchParams.get('employmentType') || undefined,
    };

    const rates = await fairworkClient.getRates(awardCode, classificationCode, query);
    return createApiResponse(rates);
  } catch (error) {
    return createErrorResponse(
      'RATES_FETCH_ERROR',
      'Failed to fetch rates',
      undefined,
      500
    );
  }
}
