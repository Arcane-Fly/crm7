import axios, { isAxiosError, type AxiosInstance } from 'axios';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const configSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  apiUrl: z.string().url('API URL must be a valid URL'),
  environment: z.enum(['sandbox', 'production']),
  timeout: z.number().positive('Timeout must be a positive number'),
});

export type FairWorkConfig = z.infer<typeof configSchema>;

export class FairWorkApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'FairWorkApiError';
  }
}

export class FairWorkClient {
  private readonly client: AxiosInstance;

  constructor(config: FairWorkConfig) {
    try {
      configSchema.parse(config);
    } catch (error) {
      throw new Error(`Invalid config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Environment': config.environment,
      },
    });
  }

  async getAward(awardCode: string) {
    try {
      const response = await this.client.get(`/awards/${awardCode}`);
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getAward');
    }
  }

  async validatePayRate(awardCode: string, classificationCode: string, rate: number) {
    try {
      const response = await this.client.post(
        `/awards/${awardCode}/classifications/${classificationCode}/validate`,
        { rate }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error, 'validatePayRate');
    }
  }

  async getAllowances(awardCode: string, params: { date: string }) {
    try {
      const response = await this.client.get(`/awards/${awardCode}/allowances`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getAllowances');
    }
  }

  async getLeaveEntitlements(awardCode: string, params: { employmentType: string; date: string }) {
    try {
      const response = await this.client.get(`/awards/${awardCode}/leave-entitlements`, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error, 'getLeaveEntitlements');
    }
  }

  private handleError(error: unknown, context: string): never {
    logger.error(`FairWork API ${context} error`, { error });

    if (isAxiosError(error)) {
      const message = error.response?.data?.message ?? error.message ?? 'Unknown API error';
      const statusCode = error.response?.status ?? 500;
      throw new FairWorkApiError(message, statusCode, { context, error: error.response?.data });
    }

    if (error instanceof Error) {
      throw new FairWorkApiError(error.message, 500, {
        context,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    }

    throw new FairWorkApiError('Unknown error occurred', 500, { context, error });
  }
}
