import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { withAuth } from '@/lib/api/auth';
import { withErrorHandler } from '@/lib/api/error-handler';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';

// Initialize services
const fairworkService = new FairWorkService(defaultConfig);
const fairworkClient = new FairWorkClient(defaultConfig);

// Request validation schemas
const BaseParamsSchema = z.object({
  awardCode: z.string(),
  classificationCode: z.string(),
  date: z.string().datetime(),
});

const SearchParamsSchema = z.object({
  query: z.string().optional(),
  industry: z.string().optional(),
  occupation: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

const CalculateParamsSchema = BaseParamsSchema.extend({
  employmentType: z.enum(['casual', 'permanent', 'fixed-term']),
  hours: z.number().optional(),
  penalties: z.array(z.string()).optional(),
  allowances: z.array(z.string()).optional(),
});

/**
 * GET /api/fairwork/awards
 * Search for awards
 */
export const GET = withErrorHandler(
  withAuth(async (req: NextRequest) => {
    const searchParams = SearchParamsSchema.parse(
      Object.fromEntries(new URL(req.url).searchParams),
    );

    const awards = await fairworkClient.searchAwards(searchParams);
    return createApiResponse(awards);
  }),
);

/**
 * POST /api/fairwork/calculate
 * Calculate pay rate
 */
export const POST = withErrorHandler(
  withAuth(async (req: NextRequest) => {
    const body = await req.json();
    const params = CalculateParamsSchema.parse(body);

    const calculation = await fairworkService.calculateRate({
      awardCode: params.awardCode,
      classificationCode: params.classificationCode,
      employmentType: params.employmentType,
      date: new Date(params.date),
      hours: params.hours,
      penalties: params.penalties,
      allowances: params.allowances,
    });

    return createApiResponse(calculation);
  }),
);
