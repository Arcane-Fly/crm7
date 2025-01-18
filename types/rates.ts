/**
 * Represents the status of a rate template
 */
export type RateTemplateStatus = 'draft' | 'active' | 'archived'

/**
 * Represents the type of rate template
 */
export type RateTemplateType = 'apprentice' | 'trainee' | 'casual' | 'permanent' | 'contract'

/**
 * Represents a rate calculation result
 * @interface RateCalculation
 */
export interface RateCalculation {
  /** Unique identifier for the calculation */
  id: string
  /** Organization identifier */
  org_id: string
  /** Template identifier used for calculation */
  template_id: string
  /** Date when calculation was performed */
  calculation_date: string
  /** Base rate amount */
  base_rate: number
  /** Optional casual loading percentage */
  casual_loading?: number
  /** Optional leave loading amount */
  leave_loading_amount?: number
  /** Optional training cost amount */
  training_cost_amount?: number
  /** Optional other costs amount */
  other_costs_amount?: number
  /** Optional funding offset amount */
  funding_offset_amount?: number
  /** Margin amount */
  margin_amount: number
  /** Superannuation amount */
  super_amount: number
  /** Leave loading amount */
  leave_loading: number
  /** Training costs */
  training_costs: number
  /** Insurance costs */
  insurance_costs: number
  /** Total cost */
  total_cost: number
  /** Final calculated rate */
  final_rate: number
  /** Creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at: string
}

/**
 * Represents a rate template
 * @interface RateTemplate
 */
export interface RateTemplate {
  /** Unique identifier for the template */
  id?: string
  /** Organization identifier */
  org_id: string
  /** Template name */
  name: string
  /** Template type name */
  template_name: string
  /** Optional description */
  description?: string
  /** Template type */
  template_type: RateTemplateType
  /** Optional base margin percentage */
  base_margin?: number
  /** Base rate amount */
  base_rate: number
  /** Workers compensation rate */
  workers_comp_rate: number
  /** Payroll tax rate */
  payroll_tax_rate: number
  /** Optional superannuation rate */
  super_rate?: number
  /** Leave loading rate */
  leave_loading_rate: number
  /** Training levy rate */
  training_levy_rate: number
  /** Insurance rate */
  insurance_rate: number
  /** Optional award identifier */
  award_id?: string
  /** Active status */
  is_active: boolean
  /** Approval status */
  is_approved: boolean
  /** Effective from date */
  effective_from: string
  /** Optional effective to date */
  effective_to?: string
  /** Version number */
  version_number: number
  /** Optional status */
  status?: RateTemplateStatus
  /** Optional metadata */
  metadata?: Record<string, unknown>
  /** Optional validation rules */
  rules?: ValidationRule[]
  /** Creation timestamp */
  created_at?: string
  /** Last update timestamp */
  updated_at?: string
  /** Template identifier */
  template_id?: string
  /** Effective date */
  effective_date?: Date
}

/**
 * Represents a validation rule for rate calculations
 * @interface ValidationRule
 */
export interface ValidationRule {
  /** Unique identifier for the rule */
  id: string
  /** Name of the rule */
  name: string
  /** Condition expression */
  condition: string
  /** Action to take when condition is met */
  action: string
  /** Additional parameters for the rule */
  parameters: Record<string, unknown>
}

/**
 * Parameters for retrieving rate templates
 * @interface GetRateTemplatesParams
 */
export interface GetRateTemplatesParams {
  /** Organization identifier */
  org_id: string
  /** Optional template identifier */
  id?: string
  /** Optional template type filter */
  template_type?: RateTemplateType
  /** Optional active status filter */
  is_active?: boolean
  /** Optional effective date filter */
  effective_date?: string
  /** Optional status filter */
  status?: RateTemplateStatus
}

/**
 * Represents an award rate
 * @interface AwardRate
 */
export interface AwardRate {
  /** Unique identifier for the award rate */
  id: string
  /** Award identifier */
  award_id: string
  /** Award name */
  name: string
  /** Base rate amount */
  base_rate: number
  /** Casual loading percentage */
  casual_loading: number
  /** Creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at: string
}

/**
 * Parameters for calculating rates
 * @interface CalculateRateParams
 */
export interface CalculateRateParams {
  /** Template identifier to use for calculation */
  template_id: string
  /** Base rate amount */
  base_rate: number
  /** Optional validation rules to apply */
  rules?: ValidationRule[]
}

/**
 * Rate analytics data structure
 * @interface RateAnalyticsData
 */
export interface RateAnalyticsData {
  /** Total number of templates */
  total_templates: number
  /** Number of active templates */
  active_templates: number
  /** Number of templates pending approval */
  pending_approvals: number
  /** Average margin across all rates */
  average_margin: number
  /** Average rate across all calculations */
  average_rate: number
  /** Minimum rate found */
  min_rate: number
  /** Maximum rate found */
  max_rate: number
  /** Trend indicator */
  trend: number
  /** Distribution of template types */
  template_types: Array<{
    /** Template type */
    type: string
    /** Count of templates of this type */
    count: number
  }>
  /** Monthly calculation statistics */
  monthly_calculations: Array<{
    /** Month identifier */
    month: string
    /** Number of calculations in the month */
    count: number
  }>
}

/**
 * Represents a rate forecast
 * @interface RateForecast
 */
export interface RateForecast {
  /** Unique identifier for the forecast */
  id: string
  /** Organization identifier */
  org_id: string
  /** Forecast date */
  forecast_date: string
  /** Forecast value */
  forecast_value: number
  /** Confidence level */
  confidence: number
  /** Optional metadata */
  metadata?: Record<string, unknown>
  /** Creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at: string
}

/**
 * Represents a rate report
 * @interface RateReport
 */
export interface RateReport {
  /** Unique identifier for the report */
  id: string
  /** Organization identifier */
  org_id: string
  /** Report date */
  report_date: string
  /** Report type */
  report_type: string
  /** Report data */
  data: Record<string, unknown>
  /** Creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at: string
}
