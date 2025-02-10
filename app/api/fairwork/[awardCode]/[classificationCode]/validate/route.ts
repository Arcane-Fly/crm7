import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';

const fairworkClient = new FairWorkClient({
  apiUrl: process.env.FAIRWORK_API_URL,
  apiKey: process.env.FAIRWORK_API_KEY,
  environment: process.env.FAIRWORK_ENVIRONMENT,
});

const validateRateSchema = z.object({
  rate: z.number().positive(),
  awardCode: z.string(),
  classificationCode: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rate, awardCode, classificationCode } = validateRateSchema.parse(body);

    const validation = await fairworkClient.validatePayRate({
      rate,
      awardCode,
      classificationCode,
    });

    return NextResponse.json(validation);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
