import { type SupabaseClient } from '@supabase/supabase-js';

import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import { ApiError } from '@/lib/utils/error';

import type {
  AwardRate,
  Classification,
  FairWorkConfig,
  GetBaseRateParams,
  GetClassificationsParams,
  GetFutureRatesParams,
  GetRateHistoryParams,
  RateCalculationRequest,
  RateCalculationResponse,
  RateValidationResponse,
  ValidateRateParams,
} from './types';

const DEFAULT_CONFIG: Required<FairWorkConfig> = {
  apiKey: process.env.FAIRWORK_API_KEY || '',
  apiUrl: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au',
  baseUrl: process.env.FAIRWORK_BASE_URL || 'https://fairwork.gov.au',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  timeout: 30000,
  retryAttempts: 3,
};

export class FairWorkService {
  private readonly supabase: SupabaseClient;
  private readonly config: Required<FairWorkConfig>;

  public constructor(config: FairWorkConfig = {}) {
    this.supabase = createClient();
    this.config = { ...DEFAULT_CONFIG, ...config };
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new ApiError({
        message: 'Invalid FairWork configuration',
        code: 'INVALID_CONFIG',
      });
    }
  }

  private async handleRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new ApiError({
          message: `FairWork API error: ${response.statusText}`,
          code: 'API_ERROR',
          statusCode: response.status,
        });
      }

      return await response.json();
    } catch (error) {
      logger.error('FairWork API request failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint,
      });
      throw new ApiError({
        message: 'Failed to communicate with FairWork API',
        code: 'API_ERROR',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Get base rate for a classification under an award
   */
  public async getBaseRate(params: GetBaseRateParams): Promise<number> {
    try {
      const response = await this.handleRequest<{ baseRate: number }>('/rates/base', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return response.baseRate;
    } catch (error) {
      logger.error('Error getting base rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get minimum wage
   */
  public async getMinimumWage(): Promise<number> {
    return this.getBaseRate({
      awardCode: 'MA000001', // National Minimum Wage
      classificationCode: 'L1', // Level 1
      date: new Date(),
    });
  }

  /**
   * Get full award rate details including penalties and allowances
   */
  public async getAwardRate(params: GetBaseRateParams): Promise<AwardRate> {
    try {
      const { data, error } = await this.supabase.rpc('get_award_rate', params);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get award rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get classifications for an award
   */
  public async getClassifications(params: GetClassificationsParams): Promise<Classification[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_award_classifications', params);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get classifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Calculate pay rate with all applicable components
   */
  public async calculateRate(params: RateCalculationRequest): Promise<RateCalculationResponse> {
    try {
      const { data, error } = await this.supabase.rpc('calculate_award_rate', params);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to calculate rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Validate if a rate complies with award minimums
   */
  public async validateRate(params: ValidateRateParams): Promise<RateValidationResponse> {
    try {
      const { data, error } = await this.supabase.rpc('validate_award_rate', params);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to validate rate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get historical rates for a classification
   */
  public async getRateHistory(params: GetRateHistoryParams): Promise<AwardRate[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_award_rate_history', params);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get rate history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get future scheduled rate changes
   */
  public async getFutureRates(params: GetFutureRatesParams): Promise<AwardRate[]> {
    try {
      const { data, error } = await this.supabase.rpc('get_future_award_rates', params);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get future rates', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params,
      });
      throw error;
    }
  }

  /**
   * Get award rates for a specific award code
   */
  public async getAwardRates(awardCode: string): Promise<AwardRate[]> {
    try {
      const response = await this.handleRequest<AwardRate[]>(`/awards/${awardCode}/rates`);
      return response;
    } catch (error) {
      logger.error(`Failed to get award rates for award ${awardCode}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        awardCode,
      });
      throw new ApiError({
        message: 'Failed to fetch award rates',
        code: 'FETCH_ERROR',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Get classification rates for a specific award and classification
   */
  public async getClassificationRates(
    awardCode: string,
    classificationCode: string,
  ): Promise<AwardRate[]> {
    try {
      const response = await this.handleRequest<AwardRate[]>(
        `/awards/${awardCode}/classifications/${classificationCode}/rates`,
      );
      return response;
    } catch (error) {
      logger.error(
        `Failed to get classification rates for award ${awardCode}, classification ${classificationCode}:`,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          awardCode,
          classificationCode,
        },
      );
      throw new ApiError({
        message: 'Failed to fetch classification rates',
        code: 'FETCH_ERROR',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }
}
