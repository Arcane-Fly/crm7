import type { UseQueryResult } from '@tanstack/react-query';

import type { BankAccount, BankTransaction, PaymentRequest } from '@/lib/types/bank';

export interface BankIntegrationResult {
  accounts: UseQueryResult<BankAccount[]>;
  transactions: UseQueryResult<BankTransaction[]>;
  createPayment: (
    payment: Omit<PaymentRequest, 'id' | 'created_at' | 'updated_at'>,
  ) => Promise<void>;
  isCreatingPayment: boolean;
}

const createQueryResult = <T>(data: T[]): UseQueryResult<T[]> => {
  const promise = Promise.resolve(data: unknown);

  const result: UseQueryResult<T[]> = {
    data,
    isLoading: false,
    error: null,
    isError: false,
    isPending: false,
    isSuccess: true,
    status: 'success',
    isLoadingError: false,
    isRefetchError: false,
    isStale: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isPaused: false,
    isPlaceholderData: false,
    isRefetching: false,
    dataUpdatedAt: Date.now(),
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    fetchStatus: 'idle',
    promise,
    refetch: async () => ({
      ...result,
      promise,
    }),
  };

  return result;
};

export function useBankIntegration(): BankIntegrationResult {
  const accounts = createQueryResult<BankAccount>([]);
  const transactions = createQueryResult<BankTransaction>([]);

  const createPayment = async (
    _payment: Omit<PaymentRequest, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<void> => {
    // Implementation
  };

  return {
    accounts,
    transactions,
    createPayment,
    isCreatingPayment: false,
  };
}
