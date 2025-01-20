import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/services/logger'

export interface BankAccount {
  id: string
  org_id: string
  bank_name: string
  account_name: string
  account_number: string
  bsb: string
  status: 'active' | 'inactive' | 'pending_verification'
  is_default: boolean
  metadata?: Record<string, any>
}

export interface BankTransaction {
  id: string
  org_id: string
  account_id: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  reference: string
  status: 'pending' | 'completed' | 'failed'
  transaction_date: string
  metadata?: Record<string, any>
}

export interface PaymentRequest {
  id: string
  org_id: string
  account_id: string
  recipient_name: string
  recipient_account: string
  recipient_bsb: string
  amount: number
  description: string
  status: 'pending' | 'approved' | 'processed' | 'failed'
  due_date?: string
  processed_date?: string
  metadata?: Record<string, any>
}

export class BankIntegrationService {
  private supabase = createClient()

  // Account Management
  async getBankAccounts(orgId: string) {
    try {
      const { data, error } = await this.supabase
        .from('bank_accounts')
        .select('*')
        .eq('org_id', orgId)
        .order('is_default', { ascending: false })

      if (error) throw error
      return { data: data as BankAccount[] }
    } catch (error) {
      logger.error('Failed to fetch bank accounts', error as Error, { orgId })
      throw error
    }
  }

  async addBankAccount(account: Omit<BankAccount, 'id' | 'status'>) {
    try {
      const { data, error } = await this.supabase
        .from('bank_accounts')
        .insert({
          ...account,
          status: 'pending_verification',
        })
        .select()
        .single()

      if (error) throw error
      return { data: data as BankAccount }
    } catch (error) {
      logger.error('Failed to add bank account', error as Error, { account })
      throw error
    }
  }

  async verifyBankAccount(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('bank_accounts')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: data as BankAccount }
    } catch (error) {
      logger.error('Failed to verify bank account', error as Error, { id })
      throw error
    }
  }

  // Transaction Management
  async getTransactions(params: {
    org_id: string
    account_id?: string
    start_date?: string
    end_date?: string
    type?: BankTransaction['type']
  }) {
    try {
      let query = this.supabase
        .from('bank_transactions')
        .select('*')
        .eq('org_id', params.org_id)
        .order('transaction_date', { ascending: false })

      if (params.account_id) {
        query = query.eq('account_id', params.account_id)
      }
      if (params.type) {
        query = query.eq('type', params.type)
      }
      if (params.start_date) {
        query = query.gte('transaction_date', params.start_date)
      }
      if (params.end_date) {
        query = query.lte('transaction_date', params.end_date)
      }

      const { data, error } = await query

      if (error) throw error
      return { data: data as BankTransaction[] }
    } catch (error) {
      logger.error('Failed to fetch transactions', error as Error, { params })
      throw error
    }
  }

  // Payment Processing
  async createPaymentRequest(payment: Omit<PaymentRequest, 'id' | 'status'>) {
    try {
      const { data, error } = await this.supabase
        .from('payment_requests')
        .insert({
          ...payment,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error
      return { data: data as PaymentRequest }
    } catch (error) {
      logger.error('Failed to create payment request', error as Error, { payment })
      throw error
    }
  }

  async approvePaymentRequest(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('payment_requests')
        .update({
          status: 'approved',
          processed_date: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: data as PaymentRequest }
    } catch (error) {
      logger.error('Failed to approve payment request', error as Error, { id })
      throw error
    }
  }

  async processPayment(paymentId: string) {
    try {
      // Here you would integrate with your actual payment gateway
      // This is just a mock implementation
      const { data: payment } = await this.supabase
        .from('payment_requests')
        .select()
        .eq('id', paymentId)
        .single()

      if (!payment) throw new Error('Payment request not found')

      // Create transaction record
      const { data: transaction, error } = await this.supabase
        .from('bank_transactions')
        .insert({
          org_id: payment.org_id,
          account_id: payment.account_id,
          type: 'debit',
          amount: payment.amount,
          description: payment.description,
          reference: `PAY-${paymentId}`,
          status: 'completed',
          transaction_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Update payment request status
      await this.supabase
        .from('payment_requests')
        .update({
          status: 'processed',
          processed_date: new Date().toISOString(),
        })
        .eq('id', paymentId)

      return { data: transaction as BankTransaction }
    } catch (error) {
      logger.error('Failed to process payment', error as Error, { paymentId })
      throw error
    }
  }

  // Analytics
  async getTransactionStats(orgId: string) {
    try {
      const { data, error } = await this.supabase.rpc('get_transaction_stats', {
        org_id: orgId,
      })

      if (error) throw error
      return { data }
    } catch (error) {
      logger.error('Failed to fetch transaction stats', error as Error, { orgId })
      throw error
    }
  }
}

export const bankIntegrationService = new BankIntegrationService()
