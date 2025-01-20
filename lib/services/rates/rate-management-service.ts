import { supabase } from '@/lib/supabase/client'
import { FairWorkService } from '@/lib/services/fairwork/fairwork-service'
import { ApiError } from '@/lib/utils/error'
import { logger } from '@/lib/services/logger'

export enum RateSourceType {
  FAIRWORK_API = 'FAIRWORK_API',
  ENTERPRISE_AGREEMENT = 'ENTERPRISE_AGREEMENT',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
}

interface PenaltyRate {
  code: string
  rate: number
  description?: string
  conditions?: Record<string, unknown>
}

interface Allowance {
  code: string
  amount: number
  isPercentage: boolean
  description?: string
  conditions?: Record<string, unknown>
}

interface RateCalculationResult {
  baseAmount: number
  casualLoadingAmount: number
  penaltyAmounts: Array<{
    code: string
    description?: string
    amount: number
  }>
  allowanceAmounts: Array<{
    code: string
    description?: string
    amount: number
  }>
  totalAmount: number
  metadata: {
    calculatedAt: Date
    effectiveDate: Date
    sourceType: RateSourceType
    sourceReference: string
    classificationCode: string
  }
}

export class RateManagementService {
  private fairWorkService: FairWorkService

  constructor(fairWorkService: FairWorkService) {
    this.fairWorkService = fairWorkService
  }

  /**
   * Sync rates from FairWork API to local database
   */
  async syncFairWorkRates(awardCode: string, classificationCode: string) {
    try {
      // Get rates from FairWork API
      const awardRate = await this.fairWorkService.getAwardRate({
        awardCode,
        classificationCode,
        date: new Date(),
      })

      // Insert or update base rate
      const { data: payRate, error: payRateError } = await supabase
        .from('pay_rates')
        .upsert({
          source_type: RateSourceType.FAIRWORK_API,
          source_reference: awardCode,
          classification_code: classificationCode,
          base_rate: awardRate.baseRate,
          casual_loading: awardRate.casualLoading,
          valid_from: awardRate.effectiveFrom,
          valid_to: awardRate.effectiveTo,
        })
        .select()
        .single()

      if (payRateError) throw payRateError

      // Insert or update penalties
      if (awardRate.penalties?.length) {
        const { error: penaltyError } = await supabase.from('penalty_rates').upsert(
          awardRate.penalties.map((penalty) => ({
            pay_rate_id: payRate.id,
            code: penalty.code,
            rate: penalty.rate,
            description: penalty.description,
          }))
        )

        if (penaltyError) throw penaltyError
      }

      // Insert or update allowances
      if (awardRate.allowances?.length) {
        const { error: allowanceError } = await supabase.from('allowances').upsert(
          awardRate.allowances.map((allowance) => ({
            pay_rate_id: payRate.id,
            code: allowance.code,
            amount: allowance.amount,
            description: allowance.description,
          }))
        )

        if (allowanceError) throw allowanceError
      }

      return payRate
    } catch (error) {
      logger.error('Error syncing FairWork rates:', error)
      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: 'Failed to sync FairWork rates',
            cause: error instanceof Error ? error : new Error(String(error)),
          })
    }
  }

  /**
   * Calculate total pay rate including penalties and allowances
   */
  async calculateTotalRate(
    payRateId: string,
    hours: number,
    date: Date,
    conditions: Record<string, unknown> = {}
  ): Promise<RateCalculationResult> {
    try {
      const { data, error } = await supabase.rpc('calculate_total_pay_rate', {
        p_pay_rate_id: payRateId,
        p_hours: hours,
        p_date: date.toISOString(),
        p_conditions: conditions,
      })

      if (error) throw error

      return {
        baseAmount: data.baseAmount,
        casualLoadingAmount: data.casualLoadingAmount,
        penaltyAmounts: data.penaltyAmounts,
        allowanceAmounts: data.allowanceAmounts,
        totalAmount: data.totalAmount,
        metadata: {
          calculatedAt: new Date(data.metadata.calculatedAt),
          effectiveDate: new Date(data.metadata.effectiveDate),
          sourceType: data.metadata.sourceType,
          sourceReference: data.metadata.sourceReference,
          classificationCode: data.metadata.classificationCode,
        },
      }
    } catch (error) {
      logger.error('Error calculating total rate:', error)
      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: 'Failed to calculate total rate',
            cause: error instanceof Error ? error : new Error(String(error)),
          })
    }
  }

  /**
   * Add or update manual pay rate
   */
  async upsertManualRate(
    classificationCode: string,
    baseRate: number,
    options: {
      casualLoading?: number
      validFrom: Date
      validTo?: Date
      penalties?: PenaltyRate[]
      allowances?: Allowance[]
    }
  ) {
    try {
      const { data: payRate, error: payRateError } = await supabase
        .from('pay_rates')
        .upsert({
          source_type: RateSourceType.MANUAL_ENTRY,
          classification_code: classificationCode,
          base_rate: baseRate,
          casual_loading: options.casualLoading,
          valid_from: options.validFrom,
          valid_to: options.validTo,
        })
        .select()
        .single()

      if (payRateError) throw payRateError

      if (options.penalties?.length) {
        const { error: penaltyError } = await supabase.from('penalty_rates').upsert(
          options.penalties.map((penalty) => ({
            pay_rate_id: payRate.id,
            ...penalty,
          }))
        )

        if (penaltyError) throw penaltyError
      }

      if (options.allowances?.length) {
        const { error: allowanceError } = await supabase.from('allowances').upsert(
          options.allowances.map((allowance) => ({
            pay_rate_id: payRate.id,
            ...allowance,
          }))
        )

        if (allowanceError) throw allowanceError
      }

      return payRate
    } catch (error) {
      logger.error('Error upserting manual rate:', error)
      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: 'Failed to upsert manual rate',
            cause: error instanceof Error ? error : new Error(String(error)),
          })
    }
  }

  /**
   * Get all rates for a classification
   */
  async getClassificationRates(classificationCode: string, date: Date = new Date()) {
    try {
      const { data, error } = await supabase
        .from('pay_rates')
        .select(
          `
          *,
          penalty_rates (*),
          allowances (*)
        `
        )
        .eq('classification_code', classificationCode)
        .lte('valid_from', date)
        .or(`valid_to.is.null,valid_to.gte.${date.toISOString()}`)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Error getting classification rates:', error)
      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: 'Failed to get classification rates',
            cause: error instanceof Error ? error : new Error(String(error)),
          })
    }
  }
}
