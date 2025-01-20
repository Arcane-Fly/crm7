import { NextRequest } from 'next/server';
import { z } from 'zod';
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';
import { logger } from '@/lib/logger';
import { createApiResponse } from '@/lib/api/response';
import { withErrorHandler } from '@/lib/api/error-handler';
import { withAuth } from '@/lib/api/auth';

// Initialize services
const fairworkService = new FairWorkService(defaultConfig);
const fairworkClient = new FairWorkClient(defaultConfig);

// Request validation schemas
const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const ValidateSchema = z.object({
  rate: z.number(),
  date: z.string().datetime(),
  employmentType: z.enum(['casual', 'permanent', 'fixed-term']),
});

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]
 * Get classification details
 */
export const GET = withErrorHandler(
  withAuth(async (
    req: NextRequest,
    { params }: { params: { awardCode: string; classificationCode: string } }
  ) => {
    const classification = await fairworkClient.getClassification(
      params.awardCode,
      params.classificationCode
    );
    return createApiResponse(classification);
  })
);

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]/rates
 * Get pay rates for a classification
 */
export async function GET_rates(
  req: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
) {
  return withErrorHandler(
    withAuth(async () => {
      const searchParams = z.object({
        date: z.string().datetime().optional(),
        employmentType: z.enum(['casual', 'permanent', 'fixed-term']).optional(),
      }).parse(Object.fromEntries(new URL(req.url).searchParams));

      const rates = await fairworkClient.getPayRates(
        params.awardCode,
        params.classificationCode,
        searchParams
      );
      return createApiResponse(rates);
    })
  )(req);
}

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]/history
 * Get historical rates for a classification
 */
export async function GET_history(
  req: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
) {
  return withErrorHandler(
    withAuth(async () => {
      const { startDate, endDate } = DateRangeSchema.parse(
        Object.fromEntries(new URL(req.url).searchParams)
      );

      const history = await fairworkService.getRateHistory({
        awardCode: params.awardCode,
        classificationCode: params.classificationCode,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      return createApiResponse(history);
    })
  )(req);
}

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]/future
 * Get future rates for a classification
 */
export async function GET_future(
  req: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
) {
  return withErrorHandler(
    withAuth(async () => {
      const { fromDate } = z.object({
        fromDate: z.string().datetime(),
      }).parse(Object.fromEntries(new URL(req.url).searchParams));

      const futureRates = await fairworkService.getFutureRates({
        awardCode: params.awardCode,
        classificationCode: params.classificationCode,
        fromDate: new Date(fromDate),
      });
      return createApiResponse(futureRates);
    })
  )(req);
}

/**
 * POST /api/fairwork/[awardCode]/[classificationCode]/validate
 * Validate a pay rate
 */
export async function POST_validate(
  req: NextRequest,
  { params }: { params: { awardCode: string; classificationCode: string } }
) {
  return withErrorHandler(
    withAuth(async () => {
      const body = await req.json();
      const { rate, date, employmentType } = ValidateSchema.parse(body);

      const validation = await fairworkService.validateRate({
        awardCode: params.awardCode,
        classificationCode: params.classificationCode,
        rate,
        date: new Date(date),
      });
      return createApiResponse(validation);
    })
  )(req);
}
