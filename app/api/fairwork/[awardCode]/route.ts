import { NextRequest } from 'next/server'
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client'
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config'
import { createApiResponse } from '@/lib/api/response'
import { withErrorHandler } from '@/lib/api/error-handler'
import { withAuth } from '@/lib/api/auth'

// Initialize services
const fairworkClient = new FairWorkClient(defaultConfig)

/**
 * GET /api/fairwork/[awardCode]
 * Get award details
 */
export const GET = withErrorHandler(
  withAuth(async (_req: NextRequest, context: { params: Record<string, string> }) => {
    const award = await fairworkClient.getAward(context.params.awardCode)
    return createApiResponse(award)
  })
)
