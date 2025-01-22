import type { RateTemplate } from '@/lib/types/rates'

export class ChargeCalculationError extends Error {
  constructor(
    message: string,
    public readonly context: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ChargeCalculationError'
  }
}

export interface RateComponents {
  superannuation: number
  leaveLoading: number
  workersComp: number
  payrollTax: number
  trainingCosts: number
  otherCosts: number
  fundingOffset: number
}

export interface RateCalculation {
  baseRate: number
  margin: number
  finalRate: number
  components: RateComponents
}

export interface ChargeResult {
  rateId: string
  amount: number
  components: {
    base: number
    margin: number
    superannuation: number
    leaveLoading: number
    workersComp: number
    payrollTax: number
    trainingCosts: number
    otherCosts: number
    fundingOffset: number
  }
}

export interface ChargeConfig {
  template: RateTemplate
  hours: number
}

class ChargeCalculationService {
  async calculateChargeRate(template: RateTemplate, hours: number): Promise<RateCalculation> {
    try {
      if (!template) {
        throw new ChargeCalculationError('Template is required', 'calculateChargeRate')
      }

      if (hours <= 0) {
        throw new ChargeCalculationError('Hours must be greater than 0', 'calculateChargeRate')
      }

      const baseRate = template.baseRate || 0
      const margin = baseRate * (template.baseMargin / 100) || 0
      const components = {
        superannuation: baseRate * (template.superRate / 100),
        leaveLoading: baseRate * (template.leaveLoading / 100),
        workersComp: baseRate * (template.workersCompRate / 100),
        payrollTax: baseRate * (template.payrollTaxRate / 100),
        trainingCosts: baseRate * (template.trainingCostRate / 100),
        otherCosts: baseRate * (template.otherCostsRate / 100),
        fundingOffset: template.fundingOffset || 0,
      }

      const totalComponents = Object.values(components).reduce((sum, val) => sum + val, 0)
      const finalRate = baseRate + margin + totalComponents

      return {
        baseRate,
        margin,
        finalRate,
        components,
      }
    } catch (error) {
      throw error instanceof ChargeCalculationError
        ? error
        : new ChargeCalculationError('Failed to calculate charge rate', 'calculateChargeRate', {
            error,
          })
    }
  }

  async calculateCharge(config: ChargeConfig): Promise<ChargeResult> {
    try {
      const { template, hours } = config
      const calculation = await this.calculateChargeRate(template, hours)

      return {
        rateId: template.id,
        amount: calculation.finalRate * hours,
        components: {
          base: calculation.baseRate,
          margin: calculation.margin,
          ...calculation.components,
        },
      }
    } catch (error) {
      throw error instanceof ChargeCalculationError
        ? error
        : new ChargeCalculationError('Failed to calculate charge', 'calculateCharge', { error })
    }
  }

  async calculateTotalCharge(template: RateTemplate, hours: number): Promise<ChargeResult> {
    try {
      const rate = await this.calculateChargeRate(template, hours)
      const totalAmount = rate.finalRate

      return {
        rateId: template.id,
        amount: totalAmount,
        components: {
          base: rate.baseRate,
          margin: rate.margin,
          ...rate.components,
        },
      }
    } catch (error) {
      if (error instanceof ChargeCalculationError) {
        throw error
      }
      throw new ChargeCalculationError('Failed to calculate total charge', 'calculateTotalCharge', {
        cause: error,
      })
    }
  }
}

export const chargeCalculationService = new ChargeCalculationService()
