import { useSupabaseQuery, useSupabaseMutation } from './use-query-with-supabase'
import type { BankAccount, BankTransaction, PaymentRequest } from '@/lib/services/bank-integration'
import { useAuth } from '@/lib/auth/context'
import { useToast } from '@/components/ui/use-toast'

export function useBankIntegration() {
  const { user } = useAuth()
  const { toast } = useToast()

  const {
    data: accounts,
    isLoading: accountsLoading,
    error: accountsError,
  } = useSupabaseQuery<BankAccount>({
    queryKey: ['bank-accounts', user?.org_id],
    table: 'bank_accounts',
    filter: user ? [{ column: 'org_id', value: user.org_id }] : undefined,
    enabled: !!user,
  })

  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useSupabaseQuery<BankTransaction>({
    queryKey: ['bank-transactions', user?.org_id],
    table: 'bank_transactions',
    filter: user ? [{ column: 'org_id', value: user.org_id }] : undefined,
    enabled: !!user,
  })

  const { mutate: addBankAccount } = useSupabaseMutation<BankAccount>({
    table: 'bank_accounts',
    type: 'insert',
    onSuccess: () => {
      toast({
        title: 'Bank account added',
        description: 'The bank account has been added successfully.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add bank account',
        variant: 'destructive',
      })
    },
    invalidateQueries: [['bank-accounts', user?.org_id]],
  })

  const { mutate: createPayment } = useSupabaseMutation<PaymentRequest>({
    table: 'payment_requests',
    type: 'insert',
    onSuccess: () => {
      toast({
        title: 'Payment created',
        description: 'The payment request has been created successfully.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create payment request',
        variant: 'destructive',
      })
    },
    invalidateQueries: [['payment-requests', user?.org_id]],
  })

  const { mutate: approvePayment } = useSupabaseMutation<PaymentRequest>({
    table: 'payment_requests',
    type: 'update',
    onSuccess: () => {
      toast({
        title: 'Payment approved',
        description: 'The payment has been approved successfully.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to approve payment',
        variant: 'destructive',
      })
    },
    invalidateQueries: [
      ['payment-requests', user?.org_id],
      ['bank-transactions', user?.org_id],
    ],
  })

  return {
    accounts: {
      data: accounts,
      isLoading: accountsLoading,
      error: accountsError,
    },
    transactions: {
      data: transactions,
      isLoading: transactionsLoading,
      error: transactionsError,
    },
    actions: {
      addBankAccount,
      createPayment,
      approvePayment,
    },
  }
}
