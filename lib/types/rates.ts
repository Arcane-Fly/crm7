
export interface RateTemplateHistory {
  id: string
  template_id: string
  action: 'approve' | 'reject'
  notes: string
  approver_id: string
  created_at: string
}

export interface RateTemplate {
  id: string
  org_id: string
  template_name: string
  template_type: 'hourly' | 'daily' | 'fixed'
  description: string
  effective_from: string
  effective_to: string
  base_rate: number
  base_margin: number
  super_rate: number
  leave_loading: number
  workers_comp_rate: number
  payroll_tax_rate: number
  training_cost_rate: number
  other_costs_rate: number
  funding_offset: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  version_number: number
  is_approved: boolean
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface RateCalculation {
  id: string
  org_id: string
  template_id: string
  employee_id: string
  date: string
  hours: number
  base_rate: number
  multipliers: Record<string, number>
  total_amount: number
  status: 'pending' | 'approved' | 'rejected'
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface RateAnalyticsData {
  id: string
  org_id: string
  date: string
  total_calculations: number
  average_rate: number
  total_amount: number
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}
