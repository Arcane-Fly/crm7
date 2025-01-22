import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { RateManagementService } from '@/lib/services/rates/rate-management-service'
import { ChargeCalculationService } from '@/lib/services/charge-calculation/charge-calculation-service'
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service'
import { logger } from '@/lib/services/logger'

const chargeConfigSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  baseRate: z.number().min(0),
  hours: z.number().min(0),
  billingMethod: z.enum(['SPREAD_ACROSS_YEAR', 'ON_SITE_ONLY'] as const),
  onCosts: z
    .record(z.number().min(0))
    .optional(),
  trainingFees: z
    .record(z.number().min(0))
    .optional(),
})

type ChargeConfig = z.infer<typeof chargeConfigSchema>

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const config = chargeConfigSchema.parse(req.body)

    const fairWorkService = new FairWorkService({
      apiKey: process.env.FAIRWORK_API_KEY!,
      apiUrl: process.env.FAIRWORK_API_URL!,
      baseUrl: process.env.FAIRWORK_BASE_URL!,
      environment: 'sandbox',
      timeout: 5000,
      retryAttempts: 3
    })

    const rateService = new RateManagementService(fairWorkService)
    const chargeService = new ChargeCalculationService(rateService)

    const result = await chargeService.calculateCharges(config)
    const rates = chargeService.getChargeRate(result, config.billingMethod)
    const summary = chargeService.generateSummary(result)

    logger.info('Charge rates calculated successfully', {
      configId: config.id,
      orgId: config.orgId,
    })

    return res.status(200).json({
      rates,
      summary,
    })
  } catch (error) {
    logger.error('Error calculating charge rates', {
      error: error instanceof Error ? error.message : 'Unknown error',
      body: req.body,
    })

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: error.errors,
      })
    }

    return res.status(500).json({
      error: 'Internal server error',
    })
  }
}
