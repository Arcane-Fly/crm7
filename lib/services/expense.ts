import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

export interface Expense {
  id: string
  user_id: string
  org_id: string
  amount: number
  description: string
  category: ExpenseCategory
  status: ExpenseStatus
  receipt_url?: string
  submitted_at: string
  approved_at?: string
  rejected_at?: string
  approver_id?: string
  notes?: string
  metadata?: Record<string, any>
}

export type ExpenseCategory =
  | 'travel'
  | 'meals'
  | 'supplies'
  | 'training'
  | 'equipment'
  | 'other'

export type ExpenseStatus = 
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'reimbursed'

export class ExpenseService {
  private supabase = createClient<Database>()

  async getExpenses(params: { 
    org_id: string
    user_id?: string
    status?: ExpenseStatus
    start_date?: string
    end_date?: string
  }) {
    let query = this.supabase
      .from('expenses')
      .select('*')
      .eq('org_id', params.org_id)
      .order('submitted_at', { ascending: false })

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }

    if (params.status) {
      query = query.eq('status', params.status)
    }

    if (params.start_date) {
      query = query.gte('submitted_at', params.start_date)
    }

    if (params.end_date) {
      query = query.lte('submitted_at', params.end_date)
    }

    const { data, error } = await query

    if (error) throw error
    return { data: data || [] }
  }

  async createExpense(expense: Omit<Expense, 'id' | 'submitted_at'>) {
    const { data, error } = await this.supabase
      .from('expenses')
      .insert({
        ...expense,
        submitted_at: new Date().toISOString(),
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error
    return { data }
  }

  async updateExpense(id: string, updates: Partial<Expense>) {
    const { data, error } = await this.supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return { data }
  }

  async submitExpense(id: string) {
    return this.updateExpense(id, {
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
  }

  async approveExpense(id: string, approver_id: string, notes?: string) {
    return this.updateExpense(id, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approver_id,
      notes
    })
  }

  async rejectExpense(id: string, approver_id: string, notes: string) {
    return this.updateExpense(id, {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      approver_id,
      notes
    })
  }

  async uploadReceipt(file: File) {
    const { data, error } = await this.supabase
      .storage
      .from('receipts')
      .upload(`${Date.now()}-${file.name}`, file)

    if (error) throw error
    return { data }
  }

  async deleteExpense(id: string) {
    const { error } = await this.supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getExpenseStats(org_id: string) {
    const { data, error } = await this.supabase
      .rpc('get_expense_stats', { org_id })

    if (error) throw error
    return { data }
  }
}

export const expenseService = new ExpenseService()
