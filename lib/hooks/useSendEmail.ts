import { useState } from 'react'
import type { NotificationEmailParams } from '@/lib/email/service'

export function useSendEmail() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendEmail = async (params: Omit<NotificationEmailParams, 'from'>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send email'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sendEmail,
    isLoading,
    error,
  }
}
