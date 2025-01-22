import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { useQueryWithSupabase } from '@/lib/hooks/use-query-with-supabase'
import type { DateRange } from 'react-day-picker'

interface Performance {
  id: string
  date: string
  revenue: number
  expenses: number
  profit: number
  margin: number
  created_at: string
  updated_at: string
}

interface ChartData {
  date: string
  revenue: number
  expenses: number
  profit: number
  margin: number
}

export function FinancialPerformanceDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })

  const queryKey = ['performance']
  if (dateRange?.from) queryKey.push(dateRange.from.toISOString())
  if (dateRange?.to) queryKey.push(dateRange.to.toISOString())

  const { data: performance = [] } = useQueryWithSupabase<Performance[]>({
    queryKey,
    table: 'financial_performance',
    filter: dateRange
      ? [
          { column: 'date', value: dateRange.from?.toISOString() },
          { column: 'date', value: dateRange.to?.toISOString() },
        ]
      : undefined,
  })

  const filteredPerformance = performance.filter((record: Performance) => {
    if (!dateRange?.from || !dateRange?.to) return true
    const date = new Date(record.date)
    return date >= dateRange.from && date <= dateRange.to
  })

  const totalRevenue = filteredPerformance.reduce((sum: number, record: Performance) => sum + record.revenue, 0)
  const totalExpenses = filteredPerformance.reduce((sum: number, record: Performance) => sum + record.expenses, 0)
  const totalProfit = filteredPerformance.reduce((sum: number, record: Performance) => sum + record.profit, 0)
  const averageMargin =
    filteredPerformance.reduce((sum: number, record: Performance) => sum + record.margin, 0) /
      filteredPerformance.length || 0

  const chartData = filteredPerformance.reduce(
    (acc: ChartData[], record: Performance) => {
      const date = format(new Date(record.date), 'MM/dd')
      const existing = acc.find((d: ChartData) => d.date === date)
      if (existing) {
        existing.revenue += record.revenue
        existing.expenses += record.expenses
        existing.profit += record.profit
        existing.margin = (existing.profit / existing.revenue) * 100
      } else {
        acc.push({
          date,
          revenue: record.revenue,
          expenses: record.expenses,
          profit: record.profit,
          margin: record.margin,
        })
      }
      return acc
    },
    [] as ChartData[]
  )

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Financial Performance</h2>
        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Total earnings for period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Total costs for period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Profit</CardTitle>
            <CardDescription>Net earnings for period</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${totalProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Margin</CardTitle>
            <CardDescription>Profit margin percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                averageMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {averageMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Financial metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart width={800} height={400} data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis yAxisId='left' />
            <YAxis yAxisId='right' orientation='right' />
            <Tooltip />
            <Legend />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='revenue'
              stroke='#3b82f6'
              name='Revenue'
            />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='expenses'
              stroke='#ef4444'
              name='Expenses'
            />
            <Line yAxisId='left' type='monotone' dataKey='profit' stroke='#10b981' name='Profit' />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='margin'
              stroke='#8b5cf6'
              name='Margin %'
            />
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
          <CardDescription>Latest financial metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredPerformance.slice(0, 5).map((record: Performance) => (
              <div
                key={record.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <div className='font-medium'>{format(new Date(record.date), 'PPP')}</div>
                  <div className='text-sm text-muted-foreground'>
                    Revenue: ${record.revenue.toLocaleString()} | Expenses: $
                    {record.expenses.toLocaleString()}
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div
                    className={`font-medium ${
                      record.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${record.profit.toLocaleString()}
                  </div>
                  <Badge variant={record.margin >= 0 ? 'default' : 'destructive'}>
                    {record.margin.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
