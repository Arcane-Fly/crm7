import type { Database } from './supabase'

export type BankAccount = Database['public']['Tables']['bank_accounts']['Row']
export type BankTransaction = Database['public']['Tables']['bank_transactions']['Row']
export type PaymentRequest = Database['public']['Tables']['payment_requests']['Row']

export type BankAccountInsert = Database['public']['Tables']['bank_accounts']['Insert']
export type BankTransactionInsert = Database['public']['Tables']['bank_transactions']['Insert']
export type PaymentRequestInsert = Database['public']['Tables']['payment_requests']['Insert']

export type BankAccountUpdate = Database['public']['Tables']['bank_accounts']['Update']
export type BankTransactionUpdate = Database['public']['Tables']['bank_transactions']['Update']
export type PaymentRequestUpdate = Database['public']['Tables']['payment_requests']['Update']
