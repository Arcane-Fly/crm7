import { useMutation } from '@tanstack/react-query';

import type { ChargeConfig, ChargeResult } from '@/lib/services/charge-calculation/types';
import { ApiError } from '@/lib/utils/error';

interface ChargeRateResponse {
  success: boolean;
  data?: {
    result: ChargeResult;
    rates: {
      weeklyCharge: number;
      hourlyCharge: number;
    };
    summary: string;
  };
  error?: {
    message: string;
    details?: unknown;
  };
}

/**
 * Hook for calculating charge rates
 */
export function useChargeRates(): void {
  return useMutation<ChargeRateResponse, ApiError, ChargeConfig>({
    mutationFn: async (config: unknown) => {
      const response = await fetch('/api/charge-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config: unknown),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError({
          message: data.error?.message ?? 'Failed to calculate charge rates',
          statusCode: response.status,
          context: data.error?.details,
        });
      }

      return data;
    },
  });
}
