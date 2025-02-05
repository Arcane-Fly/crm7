import axios, { type AxiosInstance } from 'axios';
import { logger } from '@/lib/logger';
import type { 
  ApiError,
  Award,
  Classification,
  ClassificationHierarchy,
  Page,
  PayRate,
  RateTemplate,
  RateValidationRequest,
  RateValidationResponse
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface FairWorkApiConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
  timeout: number;
}

export class FairWorkApiClient {
  private client: AxiosInstance;

  constructor(config: FairWorkApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': config.environment,
      },
    });
  }

  private async request<T>(path: string, config: Parameters<AxiosInstance['request']>[0] = {}): Promise<T> {
    try {
      const response = await this.client.request<T>({
        ...config,
        url: path,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiError(
          error.message,
          error.response?.status || 500,
          error.response?.data
        );
      }
      throw error;
    }
  }

  async validateRate(params: RateValidationRequest): Promise<RateValidationResponse> {
    try {
      return await this.request<RateValidationResponse>('/rates/validate', {
        method: 'POST',
        data: params,
      });
    } catch (error) {
      logger.error('Failed to validate rate', { error, params });
      throw error;
    }
  }

  async getActiveAwards(): Promise<Page<Award>> {
    try {
      return await this.request<Page<Award>>('/awards/active');
    } catch (error) {
      logger.error('Failed to fetch active awards', { error });
      throw error;
    }
  }

  async getCurrentRates(awardCode: string): Promise<PayRate[]> {
    try {
      return await this.request<PayRate[]>(`/awards/${awardCode}/rates/current`);
    } catch (error) {
      logger.error('Failed to fetch current rates', { error, awardCode });
      throw error;
    }
  }

  async getRatesForDate(awardCode: string, date: string): Promise<PayRate[]> {
    try {
      return await this.request<PayRate[]>(`/awards/${awardCode}/rates/${date}`);
    } catch (error) {
      logger.error('Failed to fetch rates for date', { error, awardCode, date });
      throw error;
    }
  }

  async getClassifications(awardCode: string): Promise<Classification[]> {
    try {
      return await this.request<Classification[]>(`/awards/${awardCode}/classifications`);
    } catch (error) {
      logger.error('Failed to fetch classifications', { error, awardCode });
      throw error;
    }
  }

  async getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy> {
    try {
      return await this.request<ClassificationHierarchy>(`/awards/${awardCode}/classifications/hierarchy`);
    } catch (error) {
      logger.error('Failed to fetch classification hierarchy', { error, awardCode });
      throw error;
    }
  }

  async getRateTemplates(awardCode: string): Promise<RateTemplate[]> {
    try {
      return await this.request<RateTemplate[]>(`/awards/${awardCode}/templates`);
    } catch (error) {
      logger.error('Failed to fetch rate templates', { error, awardCode });
      throw error;
    }
  }
}

export function createClient(config: FairWorkApiConfig): FairWorkApiClient {
  return new FairWorkApiClient(config);
}
