import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { ChargeCalculationService } from '@/lib/services/charge-calculation/charge-calculation-service'
import { BillingMethod } from '@/lib/services/charge-calculation/types'
import { handleApiError } from '@/lib/utils/error'

// Validation schema for charge rate calculation request
const chargeRateSchema = z.object({
  hourlyRateAward: z.number().positive(),
  weeklyHours: z.number().positive(),
  totalPaidWeeks: z.number().positive().default(52),
  onSiteWeeks: z.number().positive(),
  annualLeaveWeeks: z.number().positive().default(4),
  sickLeaveWeeks: z.number().positive().default(2),
  trainingWeeks: z.number().positive(),
  superRate: z.number().positive().default(0.11),
  workersCompRate: z.number().positive(),
  otherOnCosts: z.record(z.string(), z.number().optional()),
  fundingOffset: z.number().default(0),
  marginRate: z.number().positive(),
  leaveLoadingRate: z.number().optional(),
  trainingFees: z.record(z.string(), z.number().optional()).optional(),
  billingMethod: z.enum([BillingMethod.SPREAD_ACROSS_YEAR, BillingMethod.ON_SITE_ONLY]),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Validate request body
    const config = chargeRateSchema.parse(req.body)

    // Calculate charge rates
    const result = await ChargeCalculationService.calculateCharges(config)

    // Get specific rates based on billing method
    const rates = ChargeCalculationService.getChargeRate(result, config.billingMethod)

    // Generate summary
    const summary = ChargeCalculationService.generateSummary(result)

    return res.status(200).json({
      success: true,
      data: {
        result,
        rates,
        summary,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid request data',
          details: error.errors,
        },
      })
    }

    const apiError = handleApiError(error)
    return res.status(apiError.statusCode).json(apiError.toResponse())
  }
}
