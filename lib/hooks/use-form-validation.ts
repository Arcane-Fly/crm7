import { useState, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function useFormValidation<T extends z.ZodType>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>,
  onSubmit?: (values: z.infer<T>) => Promise<void> | void
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  const handleSubmit = useCallback(
    async (values: z.infer<T>) => {
      try {
        setIsSubmitting(true)
        setError(null)
        if (onSubmit) {
          await onSubmit(values)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [onSubmit]
  )

  return {
    form,
    isSubmitting,
    error,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}
