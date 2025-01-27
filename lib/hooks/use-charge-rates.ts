import { useMutation } from '@tanstack/react-query';

import type { ChargeRateConfig, ChargeRateResult } from '@/lib/services/charge-calculation/types';
import { ApiError } from '@/lib/utils/error';

interface ChargeRateResponse {
  success: boolean;
  data?: {
    result: ChargeRateResult;
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
export function useChargeRates() {
  return useMutation<ChargeRateResponse, ApiError, ChargeRateConfig>({
    mutationFn: async (config) => {
      const response = await fetch('/api/charge-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError({
          message: data.error?.message || 'Failed to calculate charge rates',
          statusCode: response.status,
          context: data.error?.details,
        });
      }

      return data;
    },
  });
}
