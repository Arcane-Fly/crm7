import { BaseService, type ServiceOptions } from '@/lib/utils/service';
import { createLogger } from '../logger';
import { type FairWorkApiClient } from './api-client';
import type {
  Award,
  Classification,
  ClassificationHierarchy,
  PayRate,
  RateTemplate,
  RateValidationRequest,
  RateValidationResponse,
} from './types';

const logger = createLogger('FairWorkService');

export interface FairWorkService {
  getActiveAwards(): Promise<Award[]>;
  getAward(code: string): Promise<Award | null>;
  getCurrentRates(): Promise<PayRate[]>;
  getRatesForDate(date: Date): Promise<PayRate[]>;
  getClassifications(): Promise<Classification[]>;
  getClassificationHierarchy(): Promise<ClassificationHierarchy | null>;
  getRateTemplates(): Promise<RateTemplate[]>;
  validateRateTemplate(request: RateValidationRequest): Promise<RateValidationResponse>;
  calculateBaseRate(code: string): Promise<number | null>;
}

class FairWorkServiceImpl extends BaseService implements FairWorkService {
  constructor(
    private apiClient: FairWorkApiClient,
    options: ServiceOptions
  ) {
    super(options);
  }

  private static parseDateFields<T extends { effectiveFrom: string; effectiveTo?: string }>(
    items: T[]
  ): T[] {
    return items.map((item) => ({
      ...item,
      effectiveFrom: new Date(item.effectiveFrom),
      effectiveTo: item.effectiveTo ? new Date(item.effectiveTo) : undefined,
    }));
  }

  private async handleApiCall<T>(apiCall: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      logger.error(errorMessage, error as Error);
      throw error;
    }
  }

  async getActiveAwards(): Promise<Award[]> {
    return this.handleApiCall(async () => {
      const awards = await this.apiClient.getActiveAwards();
      return FairWorkServiceImpl.parseDateFields(awards);
    }, 'Failed to get active awards');
  }

  async getAward(code: string): Promise<Award | null> {
    return this.handleApiCall(async () => {
      const award = await this.apiClient.getAward(code);
      return award ? FairWorkServiceImpl.parseDateFields([award])[0] : null;
    }, 'Failed to get award');
  }

  async getCurrentRates(): Promise<PayRate[]> {
    return this.handleApiCall(async () => {
      const rates = await this.apiClient.getCurrentRates();
      return FairWorkServiceImpl.parseDateFields(rates);
    }, 'Failed to get current rates');
  }

  async getRatesForDate(date: Date): Promise<PayRate[]> {
    return this.handleApiCall(async () => {
      const rates = await this.apiClient.getRatesForDate(date.toISOString());
      return FairWorkServiceImpl.parseDateFields(rates);
    }, 'Failed to get rates for date');
  }

  async getClassifications(): Promise<Classification[]> {
    return this.handleApiCall(
      () => this.apiClient.getClassifications(),
      'Failed to get classifications'
    );
  }

  async getClassificationHierarchy(): Promise<ClassificationHierarchy | null> {
    return this.handleApiCall(
      () => this.apiClient.getClassificationHierarchy(),
      'Failed to get classification hierarchy'
    );
  }

  async getRateTemplates(): Promise<RateTemplate[]> {
    return this.handleApiCall(
      () => this.apiClient.getRateTemplates(),
      'Failed to get rate templates'
    );
  }

  async validateRateTemplate(request: RateValidationRequest): Promise<RateValidationResponse> {
    return this.handleApiCall(
      () => this.apiClient.validateRateTemplate(request),
      'Failed to validate rate template'
    );
  }

  async calculateBaseRate(code: string): Promise<number | null> {
    return this.handleApiCall(
      () => this.apiClient.calculateBaseRate(code),
      'Failed to calculate base rate'
    );
  }
}

// Export the implementation as the service
export const FairWorkService = FairWorkServiceImpl;
export default FairWorkServiceImpl;
