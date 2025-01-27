export type RateTemplateStatus = 'draft' | 'active' | 'archived' | 'deleted';

export interface RateTemplate {
  id: string;
  name: string;
  description?: string;
  orgId: string;
  templateType: 'hourly' | 'daily' | 'fixed';

  // Base rates and margins
  baseRate: number;
  baseMargin: number;
  superRate: number;
  leaveLoading: number;
  workersCompRate: number;
  payrollTaxRate: number;
  trainingCostRate: number;
  otherCostsRate: number;
  fundingOffset: number;
  casualLoading: number;

  // Effective dates
  effectiveFrom: string | null;
  effectiveTo: string | null;

  // Metadata
  status: RateTemplateStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface RateCalculation {
  templateId: string;
  baseRate: number;
  adjustments: {
    location?: number;
    skill?: number;
  };
  leave_loading_amount: number;
  training_cost_amount: number;
  other_costs_amount: number;
  funding_offset_amount: number;
  totalRate: number;
  final_rate: number;
  metadata?: Record<string, unknown>;
  calculatedAt: string;
}

export interface RateTemplateHistory {
  id: string;
  template_id: string;
  org_id: string;
  changes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RateAnalyticsData {
  totalTemplates: number;
  activeTemplates: number;
  averageRate: number;
  recentChanges: Array<{
    id: string;
    date: string;
    type: string;
    details: string;
  }>;
}

export interface RatesService {
  // Template Management
  getTemplates: (params: { orgId: string }) => Promise<{ data: RateTemplate[] }>;
  getRateTemplateById: (id: string) => Promise<RateTemplate>;
  createRateTemplate: (template: Partial<RateTemplate>) => Promise<RateTemplate>;
  updateRateTemplate: (id: string, template: Partial<RateTemplate>) => Promise<RateTemplate>;
  updateRateTemplateStatus: (
    id: string,
    status: RateTemplateStatus,
    updatedBy: string,
  ) => Promise<void>;
  deleteRateTemplate: (id: string) => Promise<void>;
  getRateTemplateHistory: (id: string) => Promise<{ data: RateTemplateHistory[] }>;
  getRateCalculations: (id: string) => Promise<{ data: RateCalculation[] }>;

  // Rate Calculations
  validateRateTemplate: (template: RateTemplate) => Promise<boolean>;
  calculateRate: (template: RateTemplate) => Promise<number>;
  generateQuote: () => Promise<{ data: Record<string, unknown> }>;

  // Bulk Operations
  getBulkCalculations: (orgId: string) => Promise<{ data: BulkCalculation[] }>;
  createBulkCalculation: (params: BulkCalculationParams) => Promise<{ data: BulkCalculation }>;

  // Analytics and Employee Management
  getAnalytics: (params: { orgId: string }) => Promise<{ data: RateAnalytics }>;
  getEmployees: () => Promise<{ data: Employee[] }>;
}

export interface BulkCalculation {
  id: string;
  orgId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: Array<{
    templateId: string;
    rate: number;
    error?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BulkCalculationParams {
  orgId: string;
  templateIds: string[];
}

export interface RateAnalytics {
  totalTemplates: number;
  activeTemplates: number;
  averageRate: number;
  recentChanges: {
    templateId: string;
    action: 'created' | 'updated' | 'deleted';
    timestamp: string;
  }[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
}

export interface RateCalculation {
  id: string;
  templateId: string;
  rate: number;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}
