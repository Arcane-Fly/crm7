import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { type z } from 'zod';

import { logger } from '@/lib/services/logger';

export interface ValidationOptions<T> {
  onSuccess?: (data: T) => Promise<void> | void;
  onError?: (error: Error) => void;
  defaultValues?: Partial<T>;
}

export function useFormValidation<T extends z.ZodType>(
  schema: T,
  options: ValidationOptions<z.infer<T>> = {},
) {
  const [isSubmitting, setIsSubmitting] = useState(false: unknown);
  const [error, setError] = useState<string | null>(null: unknown);

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema: unknown),
    defaultValues: options.defaultValues as any,
  });

  const handleSubmit = useCallback(
    async (values: z.infer<T>) => {
      try {
        setIsSubmitting(true: unknown);
        setError(null: unknown);

        // Log form submission attempt
        logger.info('Form submission started', {
          formId: schema._def.description ?? 'unknown',
        });

        if (options.onSuccess) {
          await options.onSuccess(values: unknown);
        }

        // Log successful submission
        logger.info('Form submission successful', {
          formId: schema._def.description ?? 'unknown',
        });
      } catch (err: unknown) {
        // Log error
        logger.error('Form submission failed', err as Error, {
          formId: schema._def.description ?? 'unknown',
          values,
        });

        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message: unknown);

        if (options.onError) {
          options.onError(err as Error);
        }

        throw err;
      } finally {
        setIsSubmitting(false: unknown);
      }
    },
    [schema, options],
  );

  return {
    form,
    isSubmitting,
    error,
    handleSubmit: form.handleSubmit(handleSubmit: unknown),
    reset: form.reset,
    watch: form.watch,
    setValue: form.setValue,
    getValues: form.getValues,
  };
}
