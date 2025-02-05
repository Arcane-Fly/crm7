import axios, { type AxiosInstance } from 'axios';
import { logger } from '@/lib/logger';
import type { 
  Allowance, 
  PayRate, 
  Classification, 
  LeaveEntitlement,
  RateValidationRequest,
  RateValidationResponse,
  FairWorkConfig
} from './types';

export class FairWorkClient {
  private client: AxiosInstance;

  constructor(config?: FairWorkConfig) {
    if (config) {
      this.client = axios.create({
        baseURL: config.apiUrl,
        timeout: config.timeout,
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Environment': config.environment,
        },
      });
    } else {
      this.client = axios.create({
        baseURL: process.env.FAIRWORK_API_URL || 'https://api.fairwork.gov.au',
        timeout: 10000,
      });
    }
  }

  private async fetch<T>(path: string, params?: { date?: string }): Promise<T> {
    try {
      const response = await this.client.get<T>(path, { params });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch data', { error, path, params });
      throw error;
    }
  }

  async getRates(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<PayRate[]> {
    return this.fetch(`/awards/${awardCode}/classifications/${classificationCode}/rates`, params);
  }

  async getAllowances(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<Allowance[]> {
    return this.fetch(`/awards/${awardCode}/classifications/${classificationCode}/allowances`, params);
  }

  async getLeaveEntitlements(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<LeaveEntitlement[]> {
    return this.fetch(`/awards/${awardCode}/classifications/${classificationCode}/leave-entitlements`, params);
  }

  async validateRate(request: RateValidationRequest): Promise<RateValidationResponse> {
    try {
      const response = await this.client.post<RateValidationResponse>('/validate', request);
      return response.data;
    } catch (error) {
      logger.error('Failed to validate rate', { error, request });
      throw error;
    }
  }

  async getClassification(
    awardCode: string,
    classificationCode: string
  ): Promise<Classification> {
    return this.fetch(`/awards/${awardCode}/classifications/${classificationCode}`);
  }

  async getFutureRates(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<PayRate[]> {
    return this.fetch(`/awards/${awardCode}/classifications/${classificationCode}/future-rates`, params);
  }

  async getRateHistory(
    awardCode: string,
    classificationCode: string,
    params?: { date?: string }
  ): Promise<PayRate[]> {
    return this.fetch(`/awards/${awardCode}/classifications/${classificationCode}/rate-history`, params);
  }
}
