import { useState } from 'react';
import { type RatesCalculator } from '@/lib/services/rates-calc';

interface ChargeRatesConfig {
  baseRate: number;
  margin: number;
  adjustments: Record<string, number>;
}

export function useChargeRates(ratesCalculator: RatesCalculator) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const calculateRate = async (config: ChargeRatesConfig) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/charge-rates/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate charge rate');
      }

      return await response.json();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Rate calculation failed');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    calculateRate,
  };
}
