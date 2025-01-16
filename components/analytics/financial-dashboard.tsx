'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, LineChart, PieChart, chartColors } from '@/components/ui/charts'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useBankIntegration } from '@/lib/hooks/use-bank-integration'
import { formatCurrency } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

export function FinancialDashboard() {
  const { transactions } = useBankIntegration()
  const [dateRange, setDateRange] = React.useState<DateRange>()

  const filteredTransactions = React.useMemo(() => {
    if (!transactions.data) return []

    return transactions.data.filter((transaction) => {
      if (!dateRange?.from || !dateRange?.to) return true
      const date = new Date(transaction.transaction_date)
      return date >= dateRange.from && date <= dateRange.to
    })
  }, [transactions.data, dateRange])

  const transactionsByType = React.useMemo(() => {
    const credits = filteredTransactions.filter(t => t.type === 'credit')
    const debits = filteredTransactions.filter(t => t.type === 'debit')

    const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0)
    const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0)

    return {
      credits,
      debits,
      totalCredits,
      totalDebits,
      balance: totalCredits - totalDebits
    }
  }, [filteredTransactions])

  const transactionsByMonth = React.useMemo(() => {
    const months: Record<string, { credits: number; debits: number }> = {}

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_date)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM

      if (!months[monthKey]) {
        months[monthKey] = { credits: 0, debits: 0 }
      }

      if (transaction.type === 'credit') {
        months[monthKey].credits += transaction.amount
      } else {
        months[monthKey].debits += transaction.amount
      }
    })

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [month, data]) => {
        acc.labels.push(month)
        acc.credits.push(data.credits)
        acc.debits.push(data.debits)
        return acc
      }, { labels: [] as string[], credits: [] as number[], debits: [] as number[] })
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Analytics</h2>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(transactionsByType.totalCredits)}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(transactionsByType.totalDebits)}
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Net Balance</h3>
          <p className={`text-3xl font-bold ${
            transactionsByType.balance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(transactionsByType.balance)}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Transactions</h3>
          <BarChart
            height={300}
            data={{
              labels: transactionsByMonth.labels,
              datasets: [
                {
                  label: 'Income',
                  data: transactionsByMonth.credits,
                  backgroundColor: chartColors.success,
                },
                {
                  label: 'Expenses',
                  data: transactionsByMonth.debits,
                  backgroundColor: chartColors.error,
                },
              ],
            }}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Trend</h3>
          <LineChart
            height={300}
            data={{
              labels: transactionsByMonth.labels,
              datasets: [
                {
                  label: 'Net Cash Flow',
                  data: transactionsByMonth.credits.map((credit, i) => 
                    credit - transactionsByMonth.debits[i]
                  ),
                  borderColor: chartColors.primary,
                  tension: 0.4,
                },
              ],
            }}
          />
        </Card>
      </div>
    </div>
  )
}
