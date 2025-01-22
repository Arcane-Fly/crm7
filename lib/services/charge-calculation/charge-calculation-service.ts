import { RateManagementService } from '../rates/rate-management-service'
import { logger } from '../logger'
import type { ChargeConfig, ChargeCalculationResult, ChargeRateResult, RateTemplate } from './types'
import { BillingMethod } from './types'

interface RateCalculation {
  rateId: string
  amount: number
  details: {
    baseRate: number
    adjustments: Array<{
      type: string
      amount: number
    }>
  }
}

interface ChargeResult {
  charges: RateCalculation[]
  metadata: {
    calculatedAt: Date
    config: ChargeConfig
  }
}

class ChargeCalculationError extends Error {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message)
    this.name = 'ChargeCalculationError'
  }
}

/**
 * Service for calculating charge rates
 */
export class ChargeCalculationService {
  private rateService: RateManagementService

  /**
   * Initialize the charge calculation service with a rate management service
   */
  constructor(rateService: RateManagementService) {
    this.rateService = rateService
  }

  private async getRateTemplates(orgId: string): Promise<RateTemplate[]> {
    try {
      const rates = await this.rateService.getRateTemplates(orgId)
      if (!rates) {
        throw new ChargeCalculationError('No rate templates found', { orgId })
      }
      return rates
    } catch (error) {
      logger.error('Failed to get rate templates', {
        message: error instanceof Error ? error.message : 'Unknown error',
        orgId,
      })
      throw new ChargeCalculationError('Failed to get rate templates', {
        orgId,
        cause: error
      })
    }
  }

  /**
   * Calculate charges based on configuration
   */
  async calculateCharges(config: ChargeConfig): Promise<ChargeCalculationResult> {
    try {
      const rates = await this.getRateTemplates(config.orgId)
      const applicableRates = rates.filter((rate) => {
        // Apply rate filtering logic based on config
        return true // Simplified for now
      })

      if (applicableRates.length === 0) {
        throw new ChargeCalculationError('No applicable rates found', { config })
      }

      const results = await Promise.all(
        applicableRates.map(async (rate) => {
          try {
            const calculation = await this.rateService.calculateRate(rate)
            return {
              rateId: rate.id,
              amount: calculation.totalRate,
              details: {
                baseRate: calculation.baseRate,
                adjustments: calculation.adjustments
              }
            }
          } catch (error) {
            logger.error('Failed to calculate rate', {
              error: error instanceof Error ? error.message : 'Unknown error',
              rateId: rate.id,
            })
            throw new ChargeCalculationError('Failed to calculate rate', {
              rateId: rate.id,
              cause: error
            })
          }
        })
      )

      const baseCharge = results.reduce((sum, calc) => sum + calc.amount * config.hours, 0)
      const otherOnCosts = Object.values(config.onCosts || {}).reduce((sum, cost) => sum + cost, 0)
      const trainingFees = Object.values(config.trainingFees || {}).reduce((sum, fee) => sum + fee, 0)

      return {
        baseCharge,
        otherOnCosts,
        trainingFees,
        totalCharge: baseCharge + otherOnCosts + trainingFees,
        hours: config.hours
      }

    } catch (error) {
      const err = new ChargeCalculationError('Failed to calculate charges', {
        config,
        cause: error
      })
      logger.error('Error calculating charges', {
        error: err.message,
        config
      })
      throw err
    }
  }

  /**
   * Get charge rate based on calculation result and billing method
   */
  getChargeRate(result: ChargeCalculationResult, billingMethod: BillingMethod): ChargeRateResult {
    return {
      chargeRate: result.totalCharge / (billingMethod === 'hourly' ? result.hours : 1),
      billingMethod,
      baseCharge: result.baseCharge,
      otherOnCosts: result.otherOnCosts,
      trainingFees: result.trainingFees,
      totalCharge: result.totalCharge
    }
  }

  /**
   * Generate a summary of the charge calculation
   */
  generateChargeSummary(result: ChargeCalculationResult) {
    try {
      logger.info('Generating charge summary', { result })

      const summary = {
        totalAmount: result.totalCharge,
        timestamp: new Date().toISOString()
      }

      logger.info('Charge summary generated', {
        summary,
        result
      })

      return summary
    } catch (error) {
      const err = new ChargeCalculationError('Failed to generate charge summary', {
        result,
        cause: error
      })
      logger.error('Error generating charge summary', {
        error: err.message,
        result
      })
      throw err
    }
  }
}
