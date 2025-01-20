import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { ApiError } from '@/lib/utils/error'

interface FairWorkConfig {
  apiKey: string
  apiUrl: string
  environment: 'sandbox' | 'production'
  timeout: number
  retryAttempts: number
  baseUrl: string
}

interface AwardRate {
  awardCode: string
  classificationCode: string
  baseRate: number
  casualLoading?: number
  penalties?: Array<{
    code: string
    rate: number
    description: string
  }>
  allowances?: Array<{
    code: string
    amount: number
    description: string
  }>
  effectiveFrom: Date
  effectiveTo?: Date
  id: string
  rate: number
  effectiveDate: string
  status: 'active' | 'inactive'
}

interface Classification {
  code: string
  name: string
  level: string
  grade?: string
  yearOfExperience?: number
  qualifications?: string[]
  parentCode?: string
  validFrom: Date
  validTo?: Date
}

interface RateCalculationRequest {
  awardCode: string
  classificationCode: string
  employmentType: 'casual' | 'permanent' | 'fixed-term'
  date: Date
  hours?: number
  penalties?: string[]
  allowances?: string[]
}

interface RateCalculationResponse {
  baseRate: number
  casualLoading?: number
  penalties: Array<{
    code: string
    rate: number
    amount: number
    description: string
  }>
  allowances: Array<{
    code: string
    amount: number
    description: string
  }>
  total: number
  breakdown: {
    base: number
    loading?: number
    penalties: number
    allowances: number
  }
  metadata: {
    calculatedAt: Date
    effectiveDate: Date
    source: 'fairwork' | 'cached'
  }
}

export class FairWorkService {
  private readonly supabase = createClient()
  private readonly config: FairWorkConfig

  constructor(config: FairWorkConfig) {
    this.config = config
    if (!config.baseUrl || !config.apiKey) {
      throw new ApiError({
        message: 'Invalid FairWork configuration',
        code: 'INVALID_CONFIG',
      })
    }
  }

  /**
   * Get base rate for a classification under an award
   */
  async getBaseRate(params: {
    awardCode: string
    classificationCode: string
    date: Date
  }): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_award_base_rate', params)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Failed to get base rate', { error, params })
      throw error
    }
  }

  /**
   * Get full award rate details including penalties and allowances
   */
  async getAwardRate(params: {
    awardCode: string
    classificationCode: string
    date: Date
  }): Promise<AwardRate> {
    try {
      const { data, error } = await this.supabase.rpc('get_award_rate', params)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Failed to get award rate', { error, params })
      throw error
    }
  }

  /**
   * Get classifications for an award
   */
  async getClassifications(params: {
    awardCode: string
    searchTerm?: string
    date?: Date
    includeInactive?: boolean
  }): Promise<Classification[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_award_classifications', params)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Failed to get classifications', { error, params })
      throw error
    }
  }

  /**
   * Calculate pay rate with all applicable components
   */
  async calculateRate(params: RateCalculationRequest): Promise<RateCalculationResponse> {
    try {
      const { data, error } = await this.supabase.rpc('calculate_award_rate', params)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Failed to calculate rate', { error, params })
      throw error
    }
  }

  /**
   * Validate if a rate complies with award minimums
   */
  async validateRate(params: {
    awardCode: string
    classificationCode: string
    rate: number
    date: Date
  }): Promise<{
    isValid: boolean
    minimumRate: number
    difference: number
  }> {
    try {
      const { data, error } = await this.supabase.rpc('validate_award_rate', params)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Failed to validate rate', { error, params })
      throw error
    }
  }

  /**
   * Get historical rates for a classification
   */
  async getRateHistory(params: {
    awardCode: string
    classificationCode: string
    startDate: Date
    endDate: Date
  }): Promise<AwardRate[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_award_rate_history', params)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Failed to get rate history', { error, params })
      throw error
    }
  }

  /**
   * Get future scheduled rate changes
   */
  async getFutureRates(params: {
    awardCode: string
    classificationCode: string
    fromDate: Date
  }): Promise<AwardRate[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_future_award_rates', params)

      if (error) throw error
      return data
    } catch (error) {
      logger.error('Failed to get future rates', { error, params })
      throw error
    }
  }

  async getAwardRates(awardCode: string): Promise<AwardRate[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/awards/${awardCode}/rates`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new ApiError({
          message: 'Failed to fetch award rates',
          code: 'FAIRWORK_API_ERROR',
          context: { status: response.status },
        })
      }

      const data = await response.json()
      return data.rates
    } catch (error) {
      logger.error('Error fetching award rates:', { error, awardCode })
      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: 'Failed to fetch award rates',
            code: 'FAIRWORK_API_ERROR',
          })
    }
  }

  async getClassificationRates(
    awardCode: string,
    classificationCode: string
  ): Promise<AwardRate[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/awards/${awardCode}/classifications/${classificationCode}/rates`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new ApiError({
          message: 'Failed to fetch classification rates',
          code: 'FAIRWORK_API_ERROR',
          context: { status: response.status },
        })
      }

      const data = await response.json()
      return data.rates
    } catch (error) {
      logger.error('Error fetching classification rates:', {
        error,
        awardCode,
        classificationCode,
      })
      throw error instanceof ApiError
        ? error
        : new ApiError({
            message: 'Failed to fetch classification rates',
            code: 'FAIRWORK_API_ERROR',
          })
    }
  }
}
