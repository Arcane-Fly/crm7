'use client'

import { useState, useEffect } from 'react'
import { ratesService } from '@/lib/services/rates'
import type { RateAnalyticsData } from '@/types/rates'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { Alert } from '@/components/ui/alert'

interface RateAnalyticsProps {
  orgId: string
}

export function RateAnalytics({ orgId }: RateAnalyticsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<RateAnalyticsData | null>(null)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        setError(null)
        const response = await ratesService.getAnalytics(orgId)
        setAnalytics(response.data)
      } catch (err) {
        const error = err as Error
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [orgId])

  if (loading) {
    return <div>Loading analytics...</div>
  }

  if (error) {
    return <Alert variant='destructive'>{error}</Alert>
  }

  if (!analytics) {
    return <div>No analytics data available</div>
  }

  return (
    <ErrorBoundary>
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold'>Rate Analytics</h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h3 className='mb-2 text-lg font-semibold'>Average Rate</h3>
            <p className='text-3xl font-bold'>${analytics.average_rate.toFixed(2)}</p>
          </div>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h3 className='mb-2 text-lg font-semibold'>Rate Range</h3>
            <p className='text-sm'>
              Min: ${analytics.min_rate.toFixed(2)} - Max: ${analytics.max_rate.toFixed(2)}
            </p>
          </div>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h3 className='mb-2 text-lg font-semibold'>Rate Trend</h3>
            <p className={`text-sm ${analytics.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.trend > 0 ? '↑' : '↓'} {Math.abs(analytics.trend)}% from last period
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
