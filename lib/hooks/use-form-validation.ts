import { useState } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';

interface UseFormValidationOptions<T> {
  schema: z.Schema<T>;
  defaultValues?: Partial<T>;
  onSuccess?: (data: T) => Promise<void>;
}

interface UseFormValidationReturn<T> extends UseFormReturn<T> {
  isSubmitting: boolean;
  error: string | null;
  handleSubmit: (data: T) => Promise<void>;
}

export function useFormValidation<T>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<T>({
    resolver: zodResolver(options.schema),
    defaultValues: options.defaultValues,
  });

  const handleSubmit = async (values: T): Promise<void> => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (options.onSuccess) {
        await options.onSuccess(values);
      }
    } catch (err) {
      let message = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...form,
    isSubmitting,
    error,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
}
