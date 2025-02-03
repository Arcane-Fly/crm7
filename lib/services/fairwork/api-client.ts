import { fetch } from '@/lib/utils/fetch';

import type {
  Award,
  RateValidationResponse,
  RateValidationRequest,
  Rate,
  GetClassificationsParams,
  Classification,
  ClassificationHierarchy,
  RateTemplate,
  Page,
  ApiError,
} from './types';

export interface FairWorkApiConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
  timeout: number;
}

export class FairWorkApiClient {
  private readonly config: FairWorkApiConfig;

  constructor(config: FairWorkApiConfig) {
    this.config = config;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: unknown,
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': this.config.apiKey,
      'X-Environment': this.config.environment,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
        signal: controller.signal,
        retry: {
          // Don't retry 4xx errors
          maxRetries: 0,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json() as ApiError;
        const apiError = {
          ...error,
          status: response.status,
          message: error.message || response.statusText,
        };
        throw apiError;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw error;
      }
      
      throw error;
    }
  }

  async validateRate(params: RateValidationRequest): Promise<RateValidationResponse> {
    return this.request<RateValidationResponse>('POST', '/rates/validate', params);
  }

  async getActiveAwards(): Promise<Page<Award>> {
    return this.request<Page<Award>>('GET', '/awards/active');
  }

  async getCurrentRates(awardCode: string): Promise<Rate[]> {
    return this.request<Rate[]>('GET', `/awards/${awardCode}/rates/current`);
  }

  async getRatesForDate(awardCode: string, date: string): Promise<Rate[]> {
    return this.request<Rate[]>('GET', `/awards/${awardCode}/rates/${date}`);
  }

  async getClassifications(awardCode: string): Promise<Classification[]> {
    return this.request<Classification[]>('GET', `/awards/${awardCode}/classifications`);
  }

  async getClassificationHierarchy(awardCode: string): Promise<ClassificationHierarchy> {
    return this.request<ClassificationHierarchy>('GET', `/awards/${awardCode}/classifications/hierarchy`);
  }

  async getRateTemplates(awardCode: string): Promise<RateTemplate[]> {
    return this.request<RateTemplate[]>('GET', `/awards/${awardCode}/templates`);
  }
}

export function createClient(config: FairWorkApiConfig): FairWorkApiClient {
  return new FairWorkApiClient(config);
}
