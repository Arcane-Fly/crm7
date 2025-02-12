import {
  type RateTemplate,
  type RateAnalytics,
  type RatesService,
  type RateAnalyticsResponse,
  RateError,
} from '@/lib/types/rates';
import { createLogger } from '@/lib/utils/logger';
import { RateManagementServiceImpl } from './rate-management-service';

const logger = createLogger('RatesService');

export class RateService implements RatesService {
  private rateManagementService: RateManagementServiceImpl;

  constructor() {
    this.rateManagementService = new RateManagementServiceImpl();
  }

  async getTemplates({ orgId }: { orgId: string }): Promise<void> {
    try {
      const templates = await this.rateManagementService.getRateTemplates(orgId);
      return { data: templates };
    } catch (error) {
      logger.error('Failed to get templates', { error, orgId });
      throw new RateError('Failed to get templates', { cause: error });
    }
  }

  async getRateTemplate(id: string): Promise<void> {
    try {
      const template = await this.rateManagementService.getRateTemplate(id);
      if (!template) {
        throw new RateError(`Template ${id} not found`);
      }
      return template;
    } catch (error) {
      logger.error('Failed to get template', { error, id });
      throw error instanceof RateError
        ? error
        : new RateError('Failed to get template', { cause: error });
    }
  }

  async createRateTemplate(template: Partial<RateTemplate>): Promise<void> {
    try {
      const newTemplate = await this.rateManagementService.createRateTemplate(template);
      return newTemplate;
    } catch (error) {
      logger.error('Failed to create template', { error });
      throw new RateError('Failed to create template', { cause: error });
    }
  }

  async updateRateTemplate(id: string, template: Partial<RateTemplate>): Promise<void> {
    try {
      const updatedTemplate = await this.rateManagementService.updateRateTemplate(id, template);
      return updatedTemplate;
    } catch (error) {
      logger.error('Failed to update template', { error, id });
      throw new RateError('Failed to update template', { cause: error });
    }
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string,
  ): Promise<void> {
    try {
      await this.rateManagementService.updateRateTemplateStatus(id, status, updatedBy);
    } catch (error) {
      logger.error('Failed to update template status', { error, id });
      throw new RateError('Failed to update template status', { cause: error });
    }
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      await this.rateManagementService.deleteRateTemplate(id);
    } catch (error) {
      logger.error('Failed to delete template', { error, id });
      throw new RateError('Failed to delete template', { cause: error });
    }
  }

  async getRateTemplateHistory(id: string): Promise<void> {
    try {
      const history = await this.rateManagementService.getRateTemplateHistory(id);
      return { data: history };
    } catch (error) {
      logger.error('Failed to get template history', { error, id });
      throw new RateError('Failed to get template history', { cause: error });
    }
  }

  async getRateCalculations(id: string): Promise<void> {
    try {
      const calculations = await this.rateManagementService.getRateCalculations(id);
      return { data: calculations };
    } catch (error) {
      logger.error('Failed to get rate calculations', { error, id });
      throw new RateError('Failed to get rate calculations', { cause: error });
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<void> {
    try {
      const result = await this.rateManagementService.validateRateTemplate(template);
      return result;
    } catch (error) {
      logger.error('Failed to validate template', { error });
      throw new RateError('Failed to validate template', { cause: error });
    }
  }

  async calculateRate(template: RateTemplate): Promise<void> {
    try {
      const result = await this.rateManagementService.calculateRate(template);
      return result;
    } catch (error) {
      logger.error('Failed to calculate rate', { error });
      throw new RateError('Failed to calculate rate', { cause: error });
    }
  }

  async getBulkCalculations(orgId: string): Promise<void> {
    try {
      const calculations = await this.rateManagementService.getBulkCalculations(orgId);
      return { data: calculations };
    } catch (error) {
      logger.error('Failed to get bulk calculations', { error, orgId });
      throw new RateError('Failed to get bulk calculations', { cause: error });
    }
  }

  async createBulkCalculation(params: BulkCalculationParams): Promise<void> {
    try {
      const result = await this.rateManagementService.createBulkCalculation(params);
      return { data: result };
    } catch (error) {
      logger.error('Failed to create bulk calculation', { error });
      throw new RateError('Failed to create bulk calculation', { cause: error });
    }
  }

  async getAnalytics({ orgId }: { orgId: string }): Promise<RateAnalyticsResponse> {
    try {
      const analytics = await this.rateManagementService.getAnalytics(orgId);
      return { data: analytics };
    } catch (error) {
      logger.error('Failed to get analytics', { error, orgId });
      throw new RateError('Failed to get analytics', { cause: error });
    }
  }
}

export const ratesService = new RateService();

export { ratesService };
export type { RateTemplate, RateAnalyticsResponse };
