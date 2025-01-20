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
const DateParamsSchema = z.object({
  date: z.string().datetime().optional(),
  type: z.string().optional(),
});

/**
 * GET /api/fairwork/[awardCode]
 * Get award details
 */
export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, { params }: { params: { awardCode: string } }) => {
    const award = await fairworkClient.getAward(params.awardCode);
    return createApiResponse(award);
  })
);

/**
 * GET /api/fairwork/[awardCode]/penalties
 * Get penalties for an award
 */
export async function GET_penalties(
  req: NextRequest,
  { params }: { params: { awardCode: string } }
) {
  return withErrorHandler(
    withAuth(async () => {
      const searchParams = DateParamsSchema.parse(
        Object.fromEntries(new URL(req.url).searchParams)
      );

      const penalties = await fairworkClient.getPenalties(params.awardCode, searchParams);
      return createApiResponse(penalties);
    })
  )(req);
}

/**
 * GET /api/fairwork/[awardCode]/allowances
 * Get allowances for an award
 */
export async function GET_allowances(
  req: NextRequest,
  { params }: { params: { awardCode: string } }
) {
  return withErrorHandler(
    withAuth(async () => {
      const searchParams = DateParamsSchema.parse(
        Object.fromEntries(new URL(req.url).searchParams)
      );

      const allowances = await fairworkClient.getAllowances(params.awardCode, searchParams);
      return createApiResponse(allowances);
    })
  )(req);
}

/**
 * GET /api/fairwork/[awardCode]/leave-entitlements
 * Get leave entitlements for an award
 */
export async function GET_leaveEntitlements(
  req: NextRequest,
  { params }: { params: { awardCode: string } }
) {
  return withErrorHandler(
    withAuth(async () => {
      const searchParams = z.object({
        employmentType: z.enum(['casual', 'permanent', 'fixed-term']),
        date: z.string().datetime().optional(),
      }).parse(Object.fromEntries(new URL(req.url).searchParams));

      const entitlements = await fairworkClient.getLeaveEntitlements(
        params.awardCode,
        searchParams
      );
      return createApiResponse(entitlements);
    })
  )(req);
}
