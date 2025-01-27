import { type NextRequest } from 'next/server';

import { withAuth } from '@/lib/api/auth';
import { withErrorHandler } from '@/lib/api/error-handler';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';

// Initialize services
const fairworkClient = new FairWorkClient(defaultConfig);

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]
 * Get classification details
 */
export const GET = withErrorHandler(
  withAuth(async (_req: NextRequest, context: { params: Record<string, string> }) => {
    const classification = await fairworkClient.getClassification(
      context.params.awardCode,
      context.params.classificationCode,
    );
    return createApiResponse(classification);
  }),
);
