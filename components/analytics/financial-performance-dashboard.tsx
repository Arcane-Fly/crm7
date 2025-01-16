'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, LineChart, chartColors } from '@/components/ui/charts'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useBankIntegration } from '@/lib/hooks/use-bank-integration'
import { formatCurrency } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'

export function FinancialPerformanceDashboard() {
  const { transactions } = useBankIntegration()
  const [dateRange, setDateRange] = React.useState<DateRange>()

  const stats = React.useMemo(() => {
    if (!transactions.data) return {
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashFlow: 0,
    }

    const filtered = transactions.data.filter(transaction => {
      if (!dateRange?.from || !dateRange?.to) return true
      const date = new Date(transaction.transaction_date)
      return date >= dateRange.from && date <= dateRange.to
    })

    const revenue = filtered
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = filtered
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netIncome: revenue - expenses,
      cashFlow: revenue - expenses,
    }
  }, [transactions.data, dateRange])

  const monthlyTrends = React.useMemo(() => {
    if (!transactions.data) return {
      labels: [],
      revenue: [],
      expenses: [],
      netIncome: [],
    }

    const monthlyData = transactions.data.reduce((acc, transaction) => {
      const month = transaction.transaction_date.slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { revenue: 0, expenses: 0 }
      }

      if (transaction.type === 'credit') {
        acc[month].revenue += transaction.amount
      } else {
        acc[month].expenses += transaction.amount
      }

      return acc
    }, {} as Record<string, { revenue: number; expenses: number }>)

    const sorted = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))

    return {
      labels: sorted.map(([month]) => month),
      revenue: sorted.map(([, data]) => data.revenue),
      expenses: sorted.map(([, data]) => data.expenses),
      netIncome: sorted.map(([, data]) => data.revenue - data.expenses),
    }
  }, [transactions.data])

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" id="financial-dashboard-title">Financial Performance</h2>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>

        <div 
          className="grid gap-6 md:grid-cols-4"
          role="region" 
          aria-labelledby="financial-dashboard-title"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <p 
              className="text-3xl font-bold text-green-600"
              role="status"
              aria-label="Total revenue"
            >
              {formatCurrency(stats.totalRevenue)}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
            <p 
              className="text-3xl font-bold text-red-600"
              role="status"
              aria-label="Total expenses"
            >
              {formatCurrency(stats.totalExpenses)}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Net Income</h3>
            <p 
              className={`text-3xl font-bold ${
                stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
              role="status"
              aria-label="Net income"
            >
              {formatCurrency(stats.netIncome)}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Cash Flow</h3>
            <p 
              className={`text-3xl font-bold ${
                stats.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
              role="status"
              aria-label="Cash flow"
            >
              {formatCurrency(stats.cashFlow)}
            </p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue vs Expenses</h3>
            <BarChart
              height={300}
              data={{
                labels: monthlyTrends.labels,
                datasets: [
                  {
                    label: 'Revenue',
                    data: monthlyTrends.revenue,
                    backgroundColor: chartColors.success,
                  },
                  {
                    label: 'Expenses',
                    data: monthlyTrends.expenses,
                    backgroundColor: chartColors.error,
                  },
                ],
              }}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Net Income Trend</h3>
            <LineChart
              height={300}
              data={{
                labels: monthlyTrends.labels,
                datasets: [
                  {
                    label: 'Net Income',
                    data: monthlyTrends.netIncome,
                    borderColor: chartColors.primary,
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
            />
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
