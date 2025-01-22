import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'
import { ApiError } from '@/lib/utils/error'

interface FairWorkConfig {
  apiKey?: string
  apiUrl?: string
  baseUrl?: string
  environment?: 'sandbox' | 'production'
  timeout?: number
  retryAttempts?: number
}

const DEFAULT_CONFIG: Required<FairWorkConfig> = {
  apiKey: process.env.FAIRWORK_API_KEY || '',
  apiUrl: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au',
  baseUrl: process.env.FAIRWORK_BASE_URL || 'https://fairwork.gov.au',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  timeout: 30000,
  retryAttempts: 3
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
  private readonly config: Required<FairWorkConfig>

  constructor(config: FairWorkConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new ApiError({
        message: 'Invalid FairWork configuration',
        code: 'INVALID_CONFIG',
      })
    }
  }

  private async handleRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new ApiError({
          message: `FairWork API error: ${response.statusText}`,
          code: 'API_ERROR',
          statusCode: response.status,
        })
      }

      return await response.json()
    } catch (error) {
      logger.error('FairWork API request failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint,
      })
      throw new ApiError({
        message: 'Failed to communicate with FairWork API',
        code: 'API_ERROR',
        cause: error instanceof Error ? error : undefined,
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
      const response = await this.handleRequest<{ baseRate: number }>(
        '/rates/base',
        {
          method: 'POST',
          body: JSON.stringify(params),
        }
      )
      return response.baseRate
    } catch (error) {
      logger.error('Error getting base rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      })
      throw error
    }
  }

  /**
   * Get minimum wage
   */
  async getMinimumWage(): Promise<number> {
    return this.getBaseRate({
      awardCode: 'MA000001', // National Minimum Wage
      classificationCode: 'L1', // Level 1
      date: new Date(),
    })
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
      logger.error('Failed to get award rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      })
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
      logger.error('Failed to get classifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      })
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
      logger.error('Failed to calculate rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      })
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
      logger.error('Failed to validate rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      })
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
      logger.error('Failed to get rate history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      })
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
      logger.error('Failed to get future rates', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      })
      throw error
    }
  }

  /**
   * Get award rates
   */
  public async getAwardRates(awardCode: string): Promise<AwardRate[]> {
    try {
      const response = await this.handleRequest<AwardRate[]>(`/awards/${awardCode}/rates`)
      return response
    } catch (error) {
      logger.error(`Failed to get award rates for award ${awardCode}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        awardCode,
      })
      throw new ApiError({
        message: 'Failed to fetch award rates',
        code: 'FETCH_ERROR',
        cause: error instanceof Error ? error : undefined,
      })
    }
  }

  /**
   * Get classification rates
   */
  public async getClassificationRates(
    awardCode: string,
    classificationCode: string
  ): Promise<AwardRate[]> {
    try {
      const response = await this.handleRequest<AwardRate[]>(
        `/awards/${awardCode}/classifications/${classificationCode}/rates`
      )
      return response
    } catch (error) {
      logger.error(
        `Failed to get classification rates for award ${awardCode}, classification ${classificationCode}:`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          awardCode,
          classificationCode,
        }
      )
      throw new ApiError({
        message: 'Failed to fetch classification rates',
        code: 'FETCH_ERROR',
        cause: error instanceof Error ? error : undefined,
      })
    }
  }
}
