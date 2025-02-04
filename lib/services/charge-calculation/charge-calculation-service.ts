import { type RateTemplate } from '@/types/rates';
import { BaseService } from '../base-service';

export class ChargeCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChargeCalculationError';
  }
}

export class ChargeCalculationService extends BaseService {
  constructor() {
    super({
      name: 'ChargeCalculationService',
      version: '1.0.0',
    });
  }

  async calculateChargeRate(template: RateTemplate, hours: number): Promise<void> {
    return this.executeServiceMethod('calculateChargeRate', async () => {
      const components = {
        base: template.baseRate * hours,
        margin: template.baseRate * (template.baseMargin / 100) * hours,
        super: template.baseRate * (template.superRate / 100) * hours,
        leave: template.baseRate * (template.leaveLoading / 100) * hours,
        workersComp: template.baseRate * (template.workersCompRate / 100) * hours,
        payrollTax: template.baseRate * (template.payrollTaxRate / 100) * hours,
        training: template.baseRate * (template.trainingCostRate / 100) * hours,
        other: template.baseRate * (template.otherCostsRate / 100) * hours,
      };

      const totalComponents = Object.values(components).reduce((sum, val) => sum + val, 0);
      const fundingOffset = template.baseRate * (template.fundingOffset / 100) * hours;

      return totalComponents - fundingOffset;
    });
  }

  async calculateBulkChargeRates(templates: RateTemplate[], hours: number): Promise<void> {
    return this.executeServiceMethod('calculateBulkChargeRates', async () => {
      const results = new Map<string, number>();

      for (const template of templates) {
        const calculation = await this.calculateChargeRate(template, hours);
        results.set(template.id, calculation);
      }

      return results;
    });
  }

  async validateChargeRate(template: RateTemplate, hours: number, proposedRate: number): Promise<void> {
    return this.executeServiceMethod('validateChargeRate', async () => {
      const rate = await this.calculateChargeRate(template, hours);
      const tolerance = 0.01; // 1% tolerance for floating point comparison
      const difference = Math.abs(rate - proposedRate);
      return difference <= rate * tolerance;
    });
  }
}
