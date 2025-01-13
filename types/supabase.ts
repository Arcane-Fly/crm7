import { Database as DatabaseGenerated } from './supabase-generated'

export type Database = DatabaseGenerated

// Common Types
export interface Organization {
  id: string
  name: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RateTemplate {
  id: string
  org_id: string
  template_name: string
  template_type: 'apprentice' | 'trainee' | 'casual' | 'permanent' | 'contractor'
  base_margin: number
  super_rate: number
  leave_loading?: number
  workers_comp_rate: number
  payroll_tax_rate: number
  training_cost_rate?: number
  other_costs_rate?: number
  funding_offset?: number
  effective_from: Date
  effective_to?: Date
  is_active: boolean
  is_approved: boolean
  version_number: number
  rules: Record<string, any>
  metadata?: Record<string, any>
}

export interface RateCalculation {
  id: string
  template_id: string
  employee_id: string
  base_rate: number
  casual_loading?: number
  allowances: any[]
  penalties: any[]
  super_amount: number
  leave_loading_amount?: number
  workers_comp_amount: number
  payroll_tax_amount: number
  training_cost_amount?: number
  other_costs_amount?: number
  funding_offset_amount?: number
  margin_amount: number
  total_cost: number
  final_rate: number
  calculation_date: Date
  metadata?: Record<string, any>
}

export interface ValidationRule {
  id: string
  org_id: string
  rule_name: string
  rule_type: 'range' | 'required' | 'comparison' | 'custom'
  field_name: string
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between'
  value: any
  error_message: string
  is_active: boolean
  priority: number
  metadata?: Record<string, any>
}

export interface MLPrediction {
  predicted_value: number
  confidence_score: number
  factors: Record<string, number>
  metadata: Record<string, any>
}

export interface MLModelMetrics {
  mae: number
  mse: number
  r2_score: number
  feature_importance: Record<string, number>
}

export interface IntegrationConfig {
  id: string
  org_id: string
  integration_type: 'payroll' | 'hr' | 'accounting' | 'custom'
  provider: string
  credentials: Record<string, any>
  settings: Record<string, any>
  is_active: boolean
  metadata?: Record<string, any>
}
