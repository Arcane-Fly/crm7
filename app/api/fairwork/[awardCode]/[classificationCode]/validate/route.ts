import { type NextRequest } from 'next/server';
import { z } from 'zod';

import { withAuth } from '@/lib/api/auth';
import { withErrorHandler } from '@/lib/api/error-handler';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';

// Initialize services
const fairworkClient = new FairWorkClient(defaultConfig);

// Request validation schemas
const ValidateSchema = z.object({
  rate: z.number(),
  date: z.string().datetime(),
  employmentType: z.enum(['casual', 'permanent', 'fixed-term']),
});

/**
 * POST /api/fairwork/[awardCode]/[classificationCode]/validate
 * Validate a pay rate
 */
export const POST = withErrorHandler(
  withAuth(async (req: NextRequest, context: { params: Record<string, string> }) => {
    const body = await req.json();
    const params = ValidateSchema.parse(body);

    const validationResult = await fairworkClient.validatePayRate(
      context.params.awardCode,
      context.params.classificationCode,
      params,
    );

    return createApiResponse(validationResult);
  }),
);
