export interface RateCalculation {
  id: string
  org_id: string
  template_id: string
  base_rate: number
  casual_loading?: number
  leave_loading_amount?: number
  training_cost_amount?: number
  other_costs_amount?: number
  funding_offset_amount?: number
  margin_amount: number
  total_cost: number
  final_rate: number
  leave_loading?: number
  training_costs?: number
  insurance_costs?: number
  created_at: string
  updated_at: string
}

export interface RateTemplate {
  id: string
  org_id: string
  name: string
  description?: string
  base_margin?: number
  super_rate?: number
  award_id?: string
  template_type: string
  is_active: boolean
  is_approved: boolean
  effective_from?: string
  effective_to?: string
  rules?: ValidationRule[]
  status: 'draft' | 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface ValidationRule {
  id: string
  name: string
  condition: string
  action: string
  parameters: Record<string, any>
}

export interface GetRateTemplatesParams {
  org_id: string
  id?: string
  template_type?: string
  is_active?: boolean
  effective_date?: string
  status?: 'draft' | 'active' | 'archived'
}

export interface AwardRate {
  id: string
  award_id: string
  name: string
  base_rate: number
  casual_loading: number
  created_at: string
  updated_at: string
}

export interface CalculateRateParams {
  template_id: string
  base_rate: number
  rules?: ValidationRule[]
}
