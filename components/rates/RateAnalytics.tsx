import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { ratesService } from '@/lib/services/rates'
import { useToast } from '@/components/ui/use-toast'
import { LineChart, BarChart, PieChart } from '@/components/ui/charts'

interface RateAnalyticsProps {
  orgId: string
}

export function RateAnalytics({ orgId }: RateAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const { toast } = useToast()

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await ratesService.getAnalytics(orgId)
      setAnalyticsData(data)
    } catch (err) {
      setError(err as Error)
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [orgId, toast])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  if (error) {
    return <div className='text-red-500'>{error.message}</div>
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>
  }

  return (
    <div className='grid gap-6'>
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Cost Trends</h3>
        <LineChart
          data={analyticsData.costTrends}
          xField='date'
          yField='cost'
          tooltipFormat={(value) => `$${value}`}
        />
      </Card>

      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Margin Analysis</h3>
        <BarChart
          data={analyticsData.marginAnalysis}
          xField='category'
          yField='margin'
          tooltipFormat={(value) => `${value}%`}
        />
      </Card>

      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Rate Distribution</h3>
        <PieChart
          data={analyticsData.rateDistribution}
          valueField='value'
          nameField='name'
          tooltipFormat={(value) => `${value}%`}
        />
      </Card>
    </div>
  )
}
