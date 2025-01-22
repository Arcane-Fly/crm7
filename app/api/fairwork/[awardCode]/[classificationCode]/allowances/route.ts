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
  date: z.string().datetime().optional(),
  type: z.string().optional(),
})

/**
 * GET /api/fairwork/[awardCode]/[classificationCode]/allowances
 * Get allowances for a classification
 */
export const GET = withErrorHandler(
  withAuth(async (req: NextRequest, context: { params: Record<string, string> }) => {
    const { searchParams } = new URL(req.url)
    const params = DateParamsSchema.parse(Object.fromEntries(searchParams))

    const allowances = await fairworkClient.getAllowances(context.params.awardCode, params)

    return createApiResponse(allowances)
  })
)
