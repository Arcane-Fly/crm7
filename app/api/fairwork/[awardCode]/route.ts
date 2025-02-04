import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

import { redis } from '@/lib/redis';
import { FairWorkApiClient } from '@/lib/services/fairwork/api-client';
import { FairWorkServiceImpl } from '@/lib/services/fairwork/fairwork-service';
import { logger } from '@/lib/utils/logger';
import { PrismaClient } from '@prisma/client';
import { metrics } from '@/lib/utils/metrics';

const log = logger.createLogger('fairwork-api');

const prisma = new PrismaClient({});
const serviceOptions = { prisma, metrics };

const fairWorkApiConfig = {
  apiKey: process.env['FAIRWORK_API_KEY'] || '',
  baseUrl: process.env['FAIRWORK_BASE_URL'] || 'https://api.fairwork.com',
  environment: (process.env['FAIRWORK_ENV'] === 'production' ? 'production' : 'sandbox') as "production" | "sandbox",
  timeout: Number(process.env['FAIRWORK_TIMEOUT']) || 5000,
};

const fairworkService = new FairWorkServiceImpl(
  new FairWorkApiClient(fairWorkApiConfig),
  redis,
  serviceOptions
);

/**
 * GET /api/fairwork/[awardCode]
 * Retrieves award details by code
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { awardCode: string } }
): Promise<void> {
  try {
    const award = await fairworkService.getAward(params.awardCode);
    if (!award) {
      log.error('Award not found', { awardCode: params.awardCode });
      return NextResponse.json({ error: 'Award not found' }, { status: 404 });
    }

    const rates = await fairworkService.getCurrentRates(params.awardCode);

    return NextResponse.json({
      award,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    log.error('Failed to get award and rates', {
      error,
      awardCode: params.awardCode,
    });
    return NextResponse.json(
      { error: 'Failed to get award and rates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fairwork/[awardCode]
 * Calculates base rate for an award classification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { awardCode: string } }
): Promise<void> {
  try {
    const { classification } = await request.json();
    if (!classification) {
      return NextResponse.json(
        { error: 'Classification is required' },
        { status: 400 }
      );
    }

    const result = await fairworkService.calculateBaseRate({
      awardCode: params.awardCode,
      classification,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    log.error('Failed to calculate base rate', {
      error,
      awardCode: params.awardCode,
    });
    return NextResponse.json(
      { error: 'Failed to calculate base rate' },
      { status: 500 }
    );
  }
}
