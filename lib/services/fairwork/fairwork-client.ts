import axios from 'axios';
import { z } from 'zod';
import { logger } from '@/lib/logger';

export const RateValidationResponse = z.object({
  isValid: z.boolean(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type RateValidationResponseType = z.infer<typeof RateValidationResponse>;

export const Award = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
});

export type AwardType = z.infer<typeof Award>;

export const Classification = z.object({
  code: z.string(),
  name: z.string(),
  level: z.string(),
  baseRate: z.number(),
});

export type ClassificationType = z.infer<typeof Classification>;

export const PayCalculationRequest = z.object({
  date: z.string(),
  hours: z.number(),
  penalty: z.string().optional(),
  allowances: z.array(z.string()).optional(),
});

export type PayCalculationRequestType = z.infer<typeof PayCalculationRequest>;

export const PayRate = z.object({
  baseRate: z.number(),
  totalRate: z.number(),
  penalties: z.array(z.string()),
  allowances: z.array(z.string()),
});

export type PayRateType = z.infer<typeof PayRate>;

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
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly environment: string;
  private client: axios.AxiosInstance;

  constructor() {
    this.apiUrl = process.env.FAIRWORK_API_URL ?? '';
    this.apiKey = process.env.FAIRWORK_API_KEY ?? '';
    this.environment = process.env.FAIRWORK_ENVIRONMENT ?? 'development';

    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'X-API-Key': this.apiKey,
        'X-Environment': this.environment,
      },
    });
  }

  private handleError(error: unknown, context: string): never {
    logger.error(`FairWork API ${context} error`, { error });

    if (error instanceof Error) {
      throw new FairWorkApiError(error.message, 500, {
        context,
        originalError: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    }

    throw new FairWorkApiError('Unknown error occurred', 500, { context });
  }

  async getAward(awardCode: string): Promise<AwardType> {
    try {
      const response = await this.client.get(`/awards/${awardCode}`);
      return Award.parse(response.data);
    } catch (error) {
      this.handleError(error, 'getAward');
    }
  }

  async searchAwards(params: { query?: string }): Promise<AwardType[]> {
    try {
      const response = await this.client.get('/awards', { params });
      return z.array(Award).parse(response.data);
    } catch (error) {
      this.handleError(error, 'searchAwards');
    }
  }

  async getClassification(
    awardCode: string,
    classificationCode: string
  ): Promise<ClassificationType> {
    try {
      const response = await this.client.get(
        `/awards/${awardCode}/classifications/${classificationCode}`
      );
      return Classification.parse(response.data);
    } catch (error) {
      this.handleError(error, 'getClassification');
    }
  }

  async calculatePay(
    awardCode: string,
    classificationCode: string,
    request: PayCalculationRequestType
  ): Promise<PayRateType> {
    try {
      const response = await this.client.post(
        `/awards/${awardCode}/classifications/${classificationCode}/calculate`,
        request
      );
      return PayRate.parse(response.data);
    } catch (error) {
      this.handleError(error, 'calculatePay');
    }
  }

  async validateRate(
    awardCode: string,
    classificationCode: string
  ): Promise<RateValidationResponseType> {
    try {
      const response = await this.client.get(
        `/awards/${awardCode}/classifications/${classificationCode}/validate`
      );
      return RateValidationResponse.parse(response.data);
    } catch (error) {
      this.handleError(error, 'validateRate');
    }
  }
}
