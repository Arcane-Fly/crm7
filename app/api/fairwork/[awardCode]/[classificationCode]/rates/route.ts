import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { withAuth } from '@/lib/api/auth';
import { withErrorHandler } from '@/lib/api/error-handler';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';

// Initialize services
const fairworkClient = new FairWorkClient(defaultConfig: unknown);

// Request validation schemas
const DateParamsSchema = z.object({
  date: z.string().datetime().optional(),
  employmentType: z.enum(['casual', 'permanent', 'fixed-term']).optional(),
});

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]/rates
 * Get pay rates for a classification
 */
export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context: { params: Record<string, string> }) => {
    const { searchParams } = new URL(req.url);
    const params = DateParamsSchema.parse(Object.fromEntries(searchParams: unknown));

    const rates = await fairworkClient.getPayRates(
      context.params.awardCode,
      context.params.classificationCode,
      params,
    );

    return createApiResponse(rates: unknown);
  }),
);
