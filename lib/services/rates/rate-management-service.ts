import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

import {
  type BulkCalculation,
  type RateAnalytics,
  type RateCalculationResult,
  type RateTemplate,
  type RateTemplateHistory,
  type RateTemplateInput,
  type RateTemplateStatus,
  type RateTemplateUpdate,
  type RateValidationResult,
} from '@/lib/types/rates';
import { logger } from '@/lib/utils/logger';

import type { FairWorkService, PayRate } from '../fairwork/index';
import type { Classification, ClassificationHierarchy } from '../fairwork/types';

const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_KEY = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export class RateManagementError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'RateManagementError';
  }
}

interface ServiceConfig {
  minimumRate: number;
}

interface RateManagementConfig {
  cacheTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: RateManagementConfig = {
  cacheTimeout: 3600000, // 1 hour
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export interface IRateManagementService {
  getRateTemplates(orgId: string): Promise<RateTemplate[]>;
  getRateTemplate(id: string): Promise<RateTemplate | null>;
  createRateTemplate(template: RateTemplateInput): Promise<RateTemplate>;
  updateRateTemplate(id: string, updates: RateTemplateUpdate): Promise<RateTemplate>;
  updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string
  ): Promise<RateTemplate>;
  deleteRateTemplate(id: string): Promise<void>;
  getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }>;
  getRateCalculations(id: string): Promise<{ data: RateCalculationResult[] }>;
  validateRateTemplate(template: RateTemplate): Promise<RateValidationResult>;
  calculateRate(template: RateTemplate): Promise<RateCalculationResult>;
  getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }>;
  createBulkCalculation(calculation: Omit<BulkCalculation, 'id'>): Promise<BulkCalculation>;
  getAnalytics(orgId: string): Promise<{ data: RateAnalytics }>;
  getCurrentRates(): Promise<PayRate[]>;
  getRatesForDate(date: Date): Promise<PayRate[]>;
  getClassifications(): Promise<Classification[]>;
  getClassificationHierarchy(): Promise<Classification[]>;
  clearCache(): void;
}

export class RateManagementServiceImpl implements IRateManagementService {
  private readonly client: SupabaseClient;
  private readonly fairWorkService: FairWorkService;
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private rateManagementConfig: RateManagementConfig;

  constructor(
    fairWorkService: FairWorkService,
    _config: Partial<ServiceConfig> = {},
    rateManagementConfig: RateManagementConfig = DEFAULT_CONFIG
  ) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    this.client = createClient(SUPABASE_URL, SUPABASE_KEY);
    this.fairWorkService = fairWorkService;
    this.rateManagementConfig = rateManagementConfig;

    // Bind methods used as callbacks
    this.mapToRateTemplate = this.mapToRateTemplate.bind(this);
  }

  // Helper methods
  private mapToRateTemplate(data: Record<string, unknown>): RateTemplate {
    return {
      id: String(data.id),
      orgId: String(data.orgId),
      name: String(data.name),
      description: String(data.description ?? ''),
      templateType: String(data.templateType) as RateTemplate['templateType'],
      baseRate: Number(data.baseRate),
      baseMargin: Number(data.baseMargin),
      superRate: Number(data.superRate),
      leaveLoading: Number(data.leaveLoading),
      workersCompRate: Number(data.workersCompRate),
      payrollTaxRate: Number(data.payrollTaxRate),
      trainingCostRate: Number(data.trainingCostRate),
      otherCostsRate: Number(data.otherCostsRate),
      fundingOffset: Number(data.fundingOffset),
      casualLoading: Number(data.casualLoading),
      effectiveFrom: String(data.effectiveFrom),
      effectiveTo: data.effectiveTo ? String(data.effectiveTo) : null,
      status: String(data.status) as RateTemplate['status'],
      createdAt: String(data.createdAt),
      updatedAt: String(data.updatedAt),
      createdBy: String(data.createdBy),
      updatedBy: String(data.updatedBy),
      version: Number(data.version),
    };
  }

  private mapFromRateTemplate(
    template: RateTemplateInput | RateTemplateUpdate
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(template)) {
      if (value !== undefined) {
        mapped[key] = value;
      }
    }

    return mapped;
  }

  protected getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.rateManagementConfig.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  protected setInCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Public methods
  async getRateTemplates(orgId: string): Promise<RateTemplate[]> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId)
        .order('createdAt', { ascending: false });

      if (error) {
        throw error;
      }

      return data ? data.map(this.mapToRateTemplate) : [];
    } catch (error) {
      logger.error('Failed to fetch rate templates', error as Error);
      throw new RateManagementError(
        'Failed to fetch rate templates',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async getRateTemplate(id: string): Promise<RateTemplate | null> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data ? this.mapToRateTemplate(data) : null;
    } catch (error) {
      logger.error('Failed to fetch rate template', error as Error);
      throw new RateManagementError(
        'Failed to fetch rate template',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async createRateTemplate(template: RateTemplateInput): Promise<RateTemplate> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .insert([this.mapFromRateTemplate(template)])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      return this.mapToRateTemplate(data);
    } catch (error) {
      logger.error('Failed to create rate template', error as Error);
      throw new RateManagementError(
        'Failed to create rate template',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async updateRateTemplate(id: string, updates: RateTemplateUpdate): Promise<RateTemplate> {
    try {
      const { data, error } = await this.client
        .from('rate_templates')
        .update(this.mapFromRateTemplate(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from update operation');
      }

      return this.mapToRateTemplate(data);
    } catch (error) {
      logger.error('Failed to update rate template', error as Error);
      throw new RateManagementError(
        'Failed to update rate template',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async updateRateTemplateStatus(
    id: string,
    status: RateTemplateStatus,
    updatedBy: string
  ): Promise<RateTemplate> {
    return this.updateRateTemplate(id, { id, status, updatedBy });
  }

  async deleteRateTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.client.from('rate_templates').delete().eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Failed to delete rate template', error as Error);
      throw new RateManagementError(
        'Failed to delete rate template',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async getRateTemplateHistory(id: string): Promise<{ data: RateTemplateHistory[] }> {
    try {
      const { data, error } = await this.client
        .from('rate_template_history')
        .select('*')
        .eq('templateId', id)
        .order('changedAt', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data ?? [] };
    } catch (error) {
      logger.error('Failed to fetch rate template history', error as Error);
      throw new RateManagementError(
        'Failed to fetch rate template history',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async getRateCalculations(id: string): Promise<{ data: RateCalculationResult[] }> {
    try {
      const { data, error } = await this.client
        .from('rate_calculations')
        .select('*')
        .eq('templateId', id)
        .order('createdAt', { ascending: false });

      if (error) {
        throw error;
      }

      return { data: data ?? [] };
    } catch (error) {
      logger.error('Failed to fetch rate calculations', error as Error);
      throw new RateManagementError(
        'Failed to fetch rate calculations',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async validateRateTemplate(template: RateTemplate): Promise<RateValidationResult> {
    try {
      const { baseRate, baseMargin, superRate } = template;
      const errors: string[] = [];
      const warnings: string[] = [];

      if (baseRate <= 0) {
        errors.push('Base rate must be greater than 0');
      }

      if (baseMargin < 0 || baseMargin > 100) {
        errors.push('Base margin must be between 0 and 100');
      }

      if (superRate < 0 || superRate > 100) {
        errors.push('Super rate must be between 0 and 100');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      logger.error('Failed to validate rate template', error as Error);
      throw new RateManagementError(
        'Failed to validate rate template',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async calculateRate(template: RateTemplate): Promise<RateCalculationResult> {
    try {
      const { baseRate, baseMargin, superRate, casualLoading } = template;

      const marginAmount = (baseRate * baseMargin) / 100;
      const superAmount = ((baseRate + marginAmount) * superRate) / 100;
      const loadingAmount = casualLoading
        ? ((baseRate + marginAmount + superAmount) * casualLoading) / 100
        : 0;

      const rate = baseRate + marginAmount + superAmount + loadingAmount;

      return {
        id: crypto.randomUUID(),
        templateId: template.id,
        rate,
        effectiveDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to calculate rate', error as Error);
      throw new RateManagementError(
        'Failed to calculate rate',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async getBulkCalculations(orgId: string): Promise<{ data: BulkCalculation[] }> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .select('*')
        .eq('orgId', orgId);

      if (error) {
        throw error;
      }

      return { data: data ?? [] };
    } catch (error) {
      logger.error('Failed to fetch bulk calculations', error as Error);
      throw new RateManagementError(
        'Failed to fetch bulk calculations',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async createBulkCalculation(calculation: Omit<BulkCalculation, 'id'>): Promise<BulkCalculation> {
    try {
      const { data, error } = await this.client
        .from('bulk_calculations')
        .insert([calculation])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      return data;
    } catch (error) {
      logger.error('Failed to create bulk calculation', error as Error);
      throw new RateManagementError(
        'Failed to create bulk calculation',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async getAnalytics(orgId: string): Promise<{ data: RateAnalytics }> {
    try {
      const { data: templates, error: templatesError } = await this.client
        .from('rate_templates')
        .select('*')
        .eq('orgId', orgId);

      if (templatesError) {
        throw templatesError;
      }

      const { data: calculations, error: calculationsError } = await this.client
        .from('rate_calculations')
        .select('*')
        .eq('orgId', orgId);

      if (calculationsError) {
        throw calculationsError;
      }

      const totalTemplates = templates?.length ?? 0;
      const activeTemplates = templates?.filter((t) => t.status === 'active').length ?? 0;
      const averageRate =
        calculations?.reduce((acc, curr) => acc + curr.rate, 0) / (calculations.length || 1);

      const recentChanges = templates
        ?.slice(-5)
        .map((t) => ({
          templateId: t.id,
          action: t.createdAt === t.updatedAt ? ('created' as const) : ('updated' as const),
          timestamp: t.updatedAt,
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        data: {
          totalTemplates,
          activeTemplates,
          averageRate,
          recentChanges: recentChanges ?? [],
        },
      };
    } catch (error) {
      logger.error('Failed to fetch analytics', error as Error);
      throw new RateManagementError(
        'Failed to fetch analytics',
        (error as PostgrestError).code ?? 'unknown'
      );
    }
  }

  async getCurrentRates(): Promise<PayRate[]> {
    const cacheKey = 'currentRates';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as PayRate[];
    }

    try {
      const rates = await this.fairWorkService.getCurrentRates();
      this.setInCache(cacheKey, rates);
      return rates;
    } catch (error) {
      logger.error('Failed to fetch current rates:', error);
      throw new Error('Failed to fetch current rates');
    }
  }

  async getRatesForDate(date: Date): Promise<PayRate[]> {
    const cacheKey = `rates_${date.toISOString()}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as PayRate[];
    }

    try {
      const rates = await this.fairWorkService.getRatesForDate(date);
      this.setInCache(cacheKey, rates);
      return rates;
    } catch (error) {
      logger.error('Failed to fetch rates for date:', error);
      throw new Error(`Failed to fetch rates for date: ${date.toISOString()}`);
    }
  }

  async getClassifications(): Promise<Classification[]> {
    const cacheKey = 'classifications';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as Classification[];
    }

    try {
      const classifications = await this.fairWorkService.getClassifications();
      this.setInCache(cacheKey, classifications);
      return classifications;
    } catch (error) {
      logger.error('Failed to fetch classifications:', error);
      throw new Error('Failed to fetch classifications');
    }
  }

  async getClassificationHierarchy(): Promise<Classification[]> {
    const cacheKey = 'classificationHierarchy';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached as Classification[];
    }

    try {
      const hierarchy = await this.fairWorkService.getClassificationHierarchy();
      if (!hierarchy) {
        return [];
      }

      // Convert ClassificationHierarchy to Classification[]
      const flattenHierarchy = (node: ClassificationHierarchy): Classification[] => {
        const classification: Classification = {
          code: node.code,
          name: node.name,
          level: '0', // Default level since ClassificationHierarchy doesn't have level
          baseRate: 0, // Default rate since ClassificationHierarchy doesn't have rate
          effectiveFrom: new Date().toISOString(), // Default date
          parentCode: undefined,
        };

        return [classification, ...(node.children ?? []).flatMap(flattenHierarchy)];
      };

      const classifications = flattenHierarchy(hierarchy);
      this.setInCache(cacheKey, classifications);
      return classifications;
    } catch (error) {
      logger.error('Failed to fetch classification hierarchy:', error);
      throw new Error('Failed to fetch classification hierarchy');
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export { RateManagementServiceImpl as RateManagementService };
