import { NextResponse } from 'next/server'
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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const config = chargeRateSchema.parse(body)

    // Calculate charge rates
    const result = await ChargeCalculationService.calculateCharges(config)

    // Get specific rates based on billing method
    const rates = ChargeCalculationService.getChargeRate(result, config.billingMethod)

    // Generate summary
    const summary = ChargeCalculationService.generateSummary(result)

    return NextResponse.json({
      success: true,
      data: {
        result,
        rates,
        summary,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    const apiError = handleApiError(error)
    return NextResponse.json(apiError.toResponse(), { status: apiError.statusCode })
  }
}
