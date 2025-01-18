import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { useAuth } from '@/lib/auth/context'
import { useToast } from '@/components/ui/use-toast'
import type { PostgrestError } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase-generated'

interface BankIntegrationState {
  accounts: {
    data: Database['public']['Tables']['bank_accounts']['Row'][] | undefined
    error: PostgrestError | null
    isLoading: boolean
  }
  transactions: {
    data: Database['public']['Tables']['bank_transactions']['Row'][] | undefined
    error: PostgrestError | null
    isLoading: boolean
  }
  payments: {
    data: Database['public']['Tables']['payment_requests']['Row'][] | undefined
    error: PostgrestError | null
    isLoading: boolean
  }
  createBankAccount: (data: Database['public']['Tables']['bank_accounts']['Insert']) => void
  createPayment: (data: Database['public']['Tables']['payment_requests']['Insert']) => void
  updatePayment: (data: {
    match: Record<string, any>
    data: Partial<Database['public']['Tables']['payment_requests']['Insert']>
  }) => void
  isCreatingBankAccount: boolean
  isCreatingPayment: boolean
  isUpdatingPayment: boolean
}

/**
 * Hook for managing bank integration functionality
 * Provides access to bank accounts, transactions, and payment requests
 * Includes mutations for creating and updating banking-related data
 *
 * @returns {BankIntegrationState} State and methods for bank integration
 */
export function useBankIntegration(): BankIntegrationState {
  const { user } = useAuth()
  const { toast } = useToast()

  const accounts = useSupabaseQuery<'bank_accounts'>({
    queryKey: ['bank-accounts', user?.org_id || ''],
    table: 'bank_accounts',
    filter: user ? [{ column: 'org_id', value: user.org_id }] : undefined,
    enabled: !!user,
  })

  const transactions = useSupabaseQuery<'bank_transactions'>({
    queryKey: ['bank-transactions', user?.org_id || ''],
    table: 'bank_transactions',
    filter: user ? [{ column: 'org_id', value: user.org_id }] : undefined,
    enabled: !!user,
  })

  const payments = useSupabaseQuery<'payment_requests'>({
    queryKey: ['payment-requests', user?.org_id || ''],
    table: 'payment_requests',
    filter: user ? [{ column: 'org_id', value: user.org_id }] : undefined,
    enabled: !!user,
  })

  const { mutate: createBankAccountMutation, isPending: isCreatingBankAccount } =
    useSupabaseMutation<'bank_accounts'>({
      table: 'bank_accounts',
      onSuccess: () => {
        toast({
          title: 'Bank account added',
          description: 'The bank account has been added successfully.',
        })
      },
      onError: (error) => {
        console.error('Failed to add bank account:', error)
        toast({
          title: 'Error adding bank account',
          description: error.message || 'Failed to add bank account. Please try again.',
          variant: 'destructive',
        })
      },
      invalidateQueries: [['bank-accounts', user?.org_id || '']],
    })

  const { mutate: createPaymentMutation, isPending: isCreatingPayment } =
    useSupabaseMutation<'payment_requests'>({
      table: 'payment_requests',
      onSuccess: () => {
        toast({
          title: 'Payment created',
          description: 'The payment request has been created successfully.',
        })
      },
      onError: (error) => {
        console.error('Failed to create payment:', error)
        toast({
          title: 'Error creating payment',
          description: error.message || 'Failed to create payment request. Please try again.',
          variant: 'destructive',
        })
      },
      invalidateQueries: [['payment-requests', user?.org_id || '']],
    })

  const { mutate: updatePaymentMutation, isPending: isUpdatingPayment } =
    useSupabaseMutation<'payment_requests'>({
      table: 'payment_requests',
      onSuccess: () => {
        toast({
          title: 'Payment updated',
          description: 'The payment request has been updated successfully.',
        })
      },
      onError: (error) => {
        console.error('Failed to update payment:', error)
        toast({
          title: 'Error updating payment',
          description: error.message || 'Failed to update payment request. Please try again.',
          variant: 'destructive',
        })
      },
      invalidateQueries: [['payment-requests', user?.org_id || '']],
    })

  const createBankAccount = (data: Database['public']['Tables']['bank_accounts']['Insert']) => {
    createBankAccountMutation({ data })
  }

  const createPayment = (data: Database['public']['Tables']['payment_requests']['Insert']) => {
    createPaymentMutation({ data })
  }

  const updatePayment = (data: {
    match: Record<string, any>
    data: Partial<Database['public']['Tables']['payment_requests']['Insert']>
  }) => {
    updatePaymentMutation(data)
  }

  return {
    accounts,
    transactions,
    payments,
    createBankAccount,
    createPayment,
    updatePayment,
    isCreatingBankAccount,
    isCreatingPayment,
    isUpdatingPayment,
  }
}
