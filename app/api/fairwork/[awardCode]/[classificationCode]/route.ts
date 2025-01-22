import { NextRequest } from 'next/server'
import { FairWorkClient } from '@/lib/services/fairwork/fairwork-client'
import { defaultConfig } from '@/lib/services/fairwork/fairwork.config'
import { createApiResponse } from '@/lib/api/response'
import { withErrorHandler } from '@/lib/api/error-handler'
import { withAuth } from '@/lib/api/auth'

// Initialize services
const fairworkClient = new FairWorkClient(defaultConfig)

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]
 * Get classification details
 */
export const GET = withErrorHandler(
  withAuth(async (_req: NextRequest, context: { params: Record<string, string> }) => {
    const classification = await fairworkClient.getClassification(
      context.params.awardCode,
      context.params.classificationCode
    )
    return createApiResponse(classification)
  })
)
