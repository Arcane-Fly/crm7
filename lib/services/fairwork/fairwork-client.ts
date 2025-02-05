import { logger } from '@/lib/logger';
import axios, { type AxiosInstance } from 'axios';
import type {
  Allowance,
  Award,
  Classification,
  FairWorkConfig,
  LeaveEntitlement,
  PayCalculationRequest,
  PayRate,
  RateValidationRequest,
  RateValidationResponse,
  SearchAwardsRequest
} from './types';

export class FairWorkClient {
  private client: AxiosInstance;

  constructor(config?: FairWorkConfig) {
    if (!config?.apiUrl) {
      throw new Error('API URL is required');
    }

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 10000,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': config.environment,
      },
    });
  }

  private async fetch<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.client.get<T>(path, { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch data', { error, path, params });
      throw error;
    }
  }

  async getAward(awardCode: string): Promise<Award> {
    return this.fetch(`/awards/${awardCode}`);
  }

  async searchAwards(params: SearchAwardsRequest): Promise<Award[]> {
    return this.fetch('/awards', params);
  }

  async getClassification(
    awardCode: string,
    classificationCode: string
  ): Promise<Classification> {
    return this.fetch(`/awards/${awardCode}/classifications/${classificationCode}`);
  }

  async calculatePay(
    awardCode: string,
    classificationCode: string,
    request: PayCalculationRequest
  ): Promise<PayRate> {
    try {
      const response = await this.client.post<PayRate>(
        `/awards/${awardCode}/classifications/${classificationCode}/calculate`,
        request
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to calculate pay', { error, awardCode, classificationCode, request });
      throw error;
    }
  }

  async validatePayRate(
    awardCode: string,
    classificationCode: string,
    request: RateValidationRequest
  ): Promise<RateValidationResponse> {
    try {
      const response = await this.client.post<RateValidationResponse>(
        `/awards/${awardCode}/classifications/${classificationCode}/validate`,
        request
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to validate pay rate', { error, awardCode, classificationCode, request });
      throw error;
    }
  }

  async getPenalties(awardCode: string, params?: { date?: string }): Promise<PayRate[]> {
    return this.fetch(`/awards/${awardCode}/penalties`, { params });
  }

  async getAllowances(awardCode: string, params?: { date?: string; type?: string }): Promise<Allowance[]> {
    return this.fetch(`/awards/${awardCode}/allowances`, { params });
  }

  async getLeaveEntitlements(
    awardCode: string,
    params?: { date?: string; employmentType?: string }
  ): Promise<LeaveEntitlement[]> {
    return this.fetch(`/awards/${awardCode}/leave-entitlements`, { params });
  }

  async getPublicHolidays(params?: { state?: string; year?: number }): Promise<string[]> {
    return this.fetch('/public-holidays', params);
  }
}
