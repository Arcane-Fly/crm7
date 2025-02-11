import { logger } from '@/lib/logger';
import { FairWorkApiError, FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const fairworkClient = new FairWorkClient();

// Validation schema
const validationSchema = z.object({
  rate: z.number(),
  date: z.string(),
  penalties: z.array(z.string()).optional(),
  allowances: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
) {
  try {
    const validationResult = validationSchema.safeParse(await request.json());

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error },
        { status: 400 }
      );
    }

    const { awardCode, classificationCode } = params;

    try {
      const validation = await fairworkClient.validateRate(awardCode, classificationCode);
      return NextResponse.json(validation);
    } catch (error) {
      if (error instanceof FairWorkApiError) {
        logger.error('FairWork API error', { error });
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }
      logger.error('Unexpected error', { error });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (error) {
    logger.error('Unexpected error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
