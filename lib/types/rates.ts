export enum RateTemplateStatus {
  Draft = 'draft',
  Pending = 'pending',
  Active = 'active',
  Inactive = 'inactive'
}

export interface RateTemplate {
  id: string
  org_id: string
  name: string
  description: string
  template_type: 'hourly' | 'daily' | 'fixed'
  base_rate: number
  base_margin: number
  super_rate: number
  leave_loading: number
  workers_comp_rate: number
  payroll_tax_rate: number
  training_cost_rate: number
  other_costs_rate: number
  funding_offset: number
  effective_from: string | null
  effective_to: string | null
  status: RateTemplateStatus
  updated_by: string
  created_at: string
  updated_at: string
}

export interface RateCalculation {
  templateId: string
  baseRate: number
  adjustments: {
    location?: number
    skill?: number
  }
  leave_loading_amount: number
  training_cost_amount: number
  other_costs_amount: number
  funding_offset_amount: number
  totalRate: number
  final_rate: number
  metadata?: Record<string, unknown>
  calculatedAt: string
}

export interface RateTemplateHistory {
  id: string
  template_id: string
  org_id: string
  changes: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RateAnalyticsData {
  totalTemplates: number
  activeTemplates: number
  averageMargin: number
  templatesByStatus: Record<RateTemplateStatus, number>
  recentCalculations: RateCalculation[]
}

export interface BulkCalculation {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  org_id: string
  error_log?: string
  is_active?: boolean
}

export interface RateAnalyticsData {
  totalTemplates: number
  activeTemplates: number
  averageRate: number
  recentChanges: Array<{
    id: string
    date: string
    type: string
    details: string
  }>
}

export interface RatesService {
  getAnalytics: (orgId: string) => Promise<{ data: RateAnalyticsData }>
  getEmployees: (orgId: string) => Promise<{ data: any[] }>
  getBulkCalculations: (orgId: string) => Promise<{ data: BulkCalculation[] }>
  createBulkCalculation: (params: { org_id: string; is_active?: boolean }) => Promise<{ data: BulkCalculation }>
  generateQuote: (templateId: string) => Promise<any>
}

export interface RateAnalyticsData {
  totalTemplates: number
  activeTemplates: number
  averageRate: number
  recentChanges: Array<{
    id: string
    date: string
    type: string
    details: string
  }>
}

export interface RatesService {
  getAnalytics: (orgId: string) => Promise<{ data: RateAnalyticsData }>
  getEmployees: (orgId: string) => Promise<{ data: any[] }>
  getBulkCalculations: (orgId: string) => Promise<{ data: BulkCalculation[] }>
  createBulkCalculation: (params: { org_id: string; is_active?: boolean }) => Promise<{ data: BulkCalculation }>
  generateQuote: (templateId: string) => Promise<any>
}
