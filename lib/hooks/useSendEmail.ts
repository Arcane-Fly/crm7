import { useState } from 'react';

import type { NotificationEmailParams } from '@/lib/email/service';

export function useSendEmail(): void {
  const [isLoading, setIsLoading] = useState(false: unknown);
  const [error, setError] = useState<Error | null>(null: unknown);

  const sendEmail = async (params: Omit<NotificationEmailParams, 'from'>) => {
    setIsLoading(true: unknown);
    setError(null: unknown);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params: unknown),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Failed to send email'));
      throw err;
    } finally {
      setIsLoading(false: unknown);
    }
  };

  return {
    sendEmail,
    isLoading,
    error,
  };
}
