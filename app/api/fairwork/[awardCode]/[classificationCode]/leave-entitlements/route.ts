import { NextRequest } from 'next/server'
import { z } from 'zod'
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client'
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config'
import { createApiResponse } from '@/lib/api/response'
import { withErrorHandler } from '@/lib/api/error-handler'
import { withAuth } from '@/lib/api/auth'

// Initialize services
const fairworkClient = new FairWorkClient(defaultConfig)

// Request validation schemas
const DateParamsSchema = z.object({
  employmentType: z.enum(['casual', 'permanent', 'fixed-term']),
  date: z.string().datetime().optional(),
})

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]/leave-entitlements
 * Get leave entitlements for a classification
 */
export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context: { params: Record<string, string> }) => {
    const { searchParams } = new URL(req.url)
    const params = DateParamsSchema.parse(Object.fromEntries(searchParams))

    const entitlements = await fairworkClient.getLeaveEntitlements(context.params.awardCode, params)

    return createApiResponse(entitlements)
  })
)
