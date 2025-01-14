export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rate_templates: {
        Row: {
          id: string
          org_id: string
          template_name: string
          template_type: string
          base_margin: number
          super_rate: number
          leave_loading?: number
          workers_comp_rate: number
          payroll_tax_rate: number
          training_cost_rate?: number
          other_costs_rate?: number
          funding_offset?: number
          effective_from: string
          effective_to?: string
          is_active: boolean
          is_approved: boolean
          version_number: number
          rules: Json
          metadata?: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          template_name: string
          template_type: string
          base_margin: number
          super_rate: number
          leave_loading?: number
          workers_comp_rate: number
          payroll_tax_rate: number
          training_cost_rate?: number
          other_costs_rate?: number
          funding_offset?: number
          effective_from: string
          effective_to?: string
          is_active?: boolean
          is_approved?: boolean
          version_number?: number
          rules?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          template_name?: string
          template_type?: string
          base_margin?: number
          super_rate?: number
          leave_loading?: number
          workers_comp_rate?: number
          payroll_tax_rate?: number
          training_cost_rate?: number
          other_costs_rate?: number
          funding_offset?: number
          effective_from?: string
          effective_to?: string
          is_active?: boolean
          is_approved?: boolean
          version_number?: number
          rules?: Json
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
