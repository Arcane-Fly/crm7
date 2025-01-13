export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type QualificationLevel =
  | 'Certificate_I'
  | 'Certificate_II'
  | 'Certificate_III'
  | 'Certificate_IV'
  | 'Diploma'
  | 'Advanced_Diploma'

export type EmploymentStatus =
  | 'Full_Time'
  | 'Part_Time'
  | 'School_Based'
  | 'Casual'

export type ApprenticeshipStatus =
  | 'Pre_Commencement'
  | 'Active'
  | 'Suspended'
  | 'Cancelled'
  | 'Completed'

export interface Database {
  public: {
    Tables: {
      integration_logs: {
        Row: {
          id: string
          integration_type: string
          status: string
          message: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          integration_type: string
          status: string
          message?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          integration_type?: string
          status?: string
          message?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          employee_id: string
          start_time: string
          end_time: string
          break_duration: number
          status: string
          overtime_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_time: string
          end_time: string
          break_duration?: number
          status?: string
          overtime_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_time?: string
          end_time?: string
          break_duration?: number
          status?: string
          overtime_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          file_path: string
          mime_type: string | null
          size_bytes: number | null
          metadata: Json | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          file_path: string
          mime_type?: string | null
          size_bytes?: number | null
          metadata?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_path?: string
          mime_type?: string | null
          size_bytes?: number | null
          metadata?: Json | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          body: string
          variables: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          body: string
          variables?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          body?: string
          variables?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      quotes: {
        Row: {
          id: string
          client_id: string
          total_amount: number
          status: string
          valid_until: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          total_amount: number
          status?: string
          valid_until?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          total_amount?: number
          status?: string
          valid_until?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          name: string
          type: string
          schedule: string | null
          last_run: string | null
          next_run: string | null
          parameters: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          schedule?: string | null
          last_run?: string | null
          next_run?: string | null
          parameters?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          schedule?: string | null
          last_run?: string | null
          next_run?: string | null
          parameters?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      apprentices: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          email: string
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postcode: string | null
          employment_status: EmploymentStatus
          apprenticeship_status: ApprenticeshipStatus
          start_date: string | null
          expected_completion_date: string | null
          actual_completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          email: string
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postcode?: string | null
          employment_status: EmploymentStatus
          apprenticeship_status: ApprenticeshipStatus
          start_date?: string | null
          expected_completion_date?: string | null
          actual_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          email?: string
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postcode?: string | null
          employment_status?: EmploymentStatus
          apprenticeship_status?: ApprenticeshipStatus
          start_date?: string | null
          expected_completion_date?: string | null
          actual_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      qualifications: {
        Row: {
          id: string
          code: string
          name: string
          level: QualificationLevel
          description: string | null
          nominal_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          level: QualificationLevel
          description?: string | null
          nominal_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          level?: QualificationLevel
          description?: string | null
          nominal_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      apprentice_qualifications: {
        Row: {
          id: string
          apprentice_id: string
          qualification_id: string
          start_date: string
          expected_completion_date: string | null
          actual_completion_date: string | null
          status: ApprenticeshipStatus
          rto_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          apprentice_id: string
          qualification_id: string
          start_date: string
          expected_completion_date?: string | null
          actual_completion_date?: string | null
          status: ApprenticeshipStatus
          rto_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          apprentice_id?: string
          qualification_id?: string
          start_date?: string
          expected_completion_date?: string | null
          actual_completion_date?: string | null
          status?: ApprenticeshipStatus
          rto_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      host_employers: {
        Row: {
          id: string
          business_name: string
          abn: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postcode: string | null
          industry_sector: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          abn: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postcode?: string | null
          industry_sector?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          abn?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postcode?: string | null
          industry_sector?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      placements: {
        Row: {
          id: string
          apprentice_id: string
          host_employer_id: string
          start_date: string
          end_date: string | null
          award_code: string
          pay_level: string
          hours_per_week: number | null
          supervisor_name: string | null
          supervisor_phone: string | null
          supervisor_email: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          apprentice_id: string
          host_employer_id: string
          start_date: string
          end_date?: string | null
          award_code: string
          pay_level: string
          hours_per_week?: number | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          supervisor_email?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          apprentice_id?: string
          host_employer_id?: string
          start_date?: string
          end_date?: string | null
          award_code?: string
          pay_level?: string
          hours_per_week?: number | null
          supervisor_name?: string | null
          supervisor_phone?: string | null
          supervisor_email?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      training_plans: {
        Row: {
          id: string
          apprentice_qualification_id: string
          units_required: number
          units_completed: number
          next_review_date: string | null
          last_review_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          apprentice_qualification_id: string
          units_required: number
          units_completed?: number
          next_review_date?: string | null
          last_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          apprentice_qualification_id?: string
          units_required?: number
          units_completed?: number
          next_review_date?: string | null
          last_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      training_units: {
        Row: {
          id: string
          training_plan_id: string
          unit_code: string
          unit_name: string
          nominal_hours: number | null
          status: string
          start_date: string | null
          completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          training_plan_id: string
          unit_code: string
          unit_name: string
          nominal_hours?: number | null
          status: string
          start_date?: string | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          training_plan_id?: string
          unit_code?: string
          unit_name?: string
          nominal_hours?: number | null
          status?: string
          start_date?: string | null
          completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress_reviews: {
        Row: {
          id: string
          apprentice_id: string
          reviewer_id: string
          review_date: string
          attendance_rating: number | null
          performance_rating: number | null
          safety_rating: number | null
          comments: string | null
          next_review_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          apprentice_id: string
          reviewer_id: string
          review_date: string
          attendance_rating?: number | null
          performance_rating?: number | null
          safety_rating?: number | null
          comments?: string | null
          next_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          apprentice_id?: string
          reviewer_id?: string
          review_date?: string
          attendance_rating?: number | null
          performance_rating?: number | null
          safety_rating?: number | null
          comments?: string | null
          next_review_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
