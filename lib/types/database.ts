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
    }
  }
}
