import axios, { type AxiosInstance } from 'axios';
import { z } from 'zod';

import { logger } from '@/lib/logger';

export const FairWorkConfigSchema = z.object({
  apiKey: z.string(),
  apiUrl: z.string().url(),
  environment: z.enum(['sandbox', 'production']),
  timeout: z.number().optional().default(30000),
  retryAttempts: z.number().optional().default(3),
});

export type FairWorkConfig = z.infer<typeof FairWorkConfigSchema>;

export class FairWorkClient {
  private readonly client: AxiosInstance;
  private readonly config: FairWorkConfig;

  constructor(config: FairWorkConfig) {
    this.config = FairWorkConfigSchema.parse(config);

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': this.config.environment,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error),
    );
  }

  /**
   * Handle API errors
   */
  private async handleError(error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error('Fair Work API error response', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      throw new Error(
        error.response.data?.message ||
          'An error occurred while communicating with the Fair Work API',
      );
    } else if (error.request) {
      // The request was made but no response was received
      logger.error('Fair Work API no response', {
        request: error.request,
      });

      throw new Error('No response received from Fair Work API');
    } else {
      // Something happened in setting up the request that triggered an Error
      logger.error('Fair Work API request setup error', {
        error: error.message,
      });

      throw new Error('Failed to make request to Fair Work API');
    }
  }

  /**
   * Get award details
   */
  async getAward(awardCode: string) {
    const response = await this.client.get(`/awards/${awardCode}`);
    return response.data;
  }

  /**
   * Search for awards
   */
  async searchAwards(params: {
    query?: string;
    industry?: string;
    occupation?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/awards', { params });
    return response.data;
  }

  /**
   * Get classification details
   */
  async getClassification(awardCode: string, classificationCode: string) {
    const response = await this.client.get(
      `/awards/${awardCode}/classifications/${classificationCode}`,
    );
    return response.data;
  }

  /**
   * Search for classifications within an award
   */
  async searchClassifications(
    awardCode: string,
    params: {
      query?: string;
      level?: string;
      grade?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const response = await this.client.get(`/awards/${awardCode}/classifications`, { params });
    return response.data;
  }

  /**
   * Get pay rates for a classification
   */
  async getPayRates(
    awardCode: string,
    classificationCode: string,
    params: {
      date?: string;
      employmentType?: 'casual' | 'permanent' | 'fixed-term';
    },
  ) {
    const response = await this.client.get(
      `/awards/${awardCode}/classifications/${classificationCode}/rates`,
      { params },
    );
    return response.data;
  }

  /**
   * Calculate pay for specific conditions
   */
  async calculatePay(
    awardCode: string,
    classificationCode: string,
    params: {
      date: string;
      employmentType: 'casual' | 'permanent' | 'fixed-term';
      hours?: number;
      penalties?: string[];
      allowances?: string[];
    },
  ) {
    const response = await this.client.post(
      `/awards/${awardCode}/classifications/${classificationCode}/calculate`,
      params,
    );
    return response.data;
  }

  /**
   * Validate a pay rate
   */
  async validatePayRate(
    awardCode: string,
    classificationCode: string,
    params: {
      rate: number;
      date: string;
      employmentType: 'casual' | 'permanent' | 'fixed-term';
    },
  ) {
    const response = await this.client.post(
      `/awards/${awardCode}/classifications/${classificationCode}/validate`,
      params,
    );
    return response.data;
  }

  /**
   * Get penalties for an award
   */
  async getPenalties(
    awardCode: string,
    params: {
      date?: string;
      type?: string;
    },
  ) {
    const response = await this.client.get(`/awards/${awardCode}/penalties`, { params });
    return response.data;
  }

  /**
   * Get allowances for an award
   */
  async getAllowances(
    awardCode: string,
    params: {
      date?: string;
      type?: string;
    },
  ) {
    const response = await this.client.get(`/awards/${awardCode}/allowances`, { params });
    return response.data;
  }

  /**
   * Get leave entitlements
   */
  async getLeaveEntitlements(
    awardCode: string,
    params: {
      employmentType: 'casual' | 'permanent' | 'fixed-term';
      date?: string;
    },
  ) {
    const response = await this.client.get(`/awards/${awardCode}/leave-entitlements`, { params });
    return response.data;
  }

  /**
   * Get public holidays
   */
  async getPublicHolidays(params: { state?: string; year?: number }) {
    const response = await this.client.get('/public-holidays', { params });
    return response.data;
  }
}
