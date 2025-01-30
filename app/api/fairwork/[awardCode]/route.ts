import { type NextRequest } from 'next/server';

import { withAuth } from '@/lib/api/auth';
import { withErrorHandler } from '@/lib/api/error-handler';
import { createApiResponse } from '@/lib/api/response';
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client';
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config';

// Initialize services
const fairworkClient = new FairWorkClient(defaultConfig);

/**
 * GET /api/fairwork/[awardCode]
 * Get award details
 */
export const GET = withErrorHandler(
  withAuth(async (_req: NextRequest, context: { params: Record<string, string> }) => {
    const award = await fairworkClient.getAward(context.params.awardCode);
    return createApiResponse(award);
  }),
);
