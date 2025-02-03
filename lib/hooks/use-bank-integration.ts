import { useState } from 'react';
import { type BankIntegrationService } from '@/lib/services/bank-integration';

export function useBankIntegration(bankIntegrationService: BankIntegrationService) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleIntegration = async (data: unknown) => {
    setIsLoading(true);
    setError(null);

    try {
      const promise = Promise.resolve(data);
      return await promise;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Bank integration failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleIntegration,
  };
}
