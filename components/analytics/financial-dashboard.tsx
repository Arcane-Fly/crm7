import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { useQueryWithSupabase } from '@/lib/hooks/use-query-with-supabase'
import type { DateRange } from 'react-day-picker'

interface Transaction {
  id: string
  transaction_date: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
}

export function FinancialDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })

  const queryKey = ['transactions']
  if (dateRange?.from) queryKey.push(dateRange.from.toISOString())
  if (dateRange?.to) queryKey.push(dateRange.to.toISOString())

  const { data: transactions = [] } = useQueryWithSupabase<Transaction>({
    queryKey,
    table: 'transactions',
    filter: dateRange
      ? [
          { column: 'transaction_date', value: dateRange.from?.toISOString() },
          { column: 'transaction_date', value: dateRange.to?.toISOString() },
        ]
      : undefined,
  })

  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    if (!dateRange?.from || !dateRange?.to) return true
    const date = new Date(transaction.transaction_date)
    return date >= dateRange.from && date <= dateRange.to
  })

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses

  const chartData = filteredTransactions.reduce(
    (acc, transaction) => {
      const date = format(new Date(transaction.transaction_date), 'MM/dd')
      const existing = acc.find((d) => d.date === date)
      if (existing) {
        if (transaction.type === 'income') {
          existing.income += transaction.amount
        } else {
          existing.expenses += transaction.amount
        }
      } else {
        acc.push({
          date,
          income: transaction.type === 'income' ? transaction.amount : 0,
          expenses: transaction.type === 'expense' ? transaction.amount : 0,
        })
      }
      return acc
    },
    [] as { date: string; income: number; expenses: number }[]
  )

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Financial Dashboard</h2>
        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
            <CardDescription>Revenue for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>${totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Costs for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>${totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Income</CardTitle>
            <CardDescription>Profit/Loss for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              ${netIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>Financial trend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart width={800} height={400} data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type='monotone' dataKey='income' stroke='#10b981' name='Income' />
            <Line type='monotone' dataKey='expenses' stroke='#ef4444' name='Expenses' />
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {filteredTransactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <div className='font-medium'>{transaction.description}</div>
                  <div className='text-sm text-muted-foreground'>
                    {format(new Date(transaction.transaction_date), 'PPP')} - {transaction.category}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div
                    className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}$
                    {transaction.amount.toLocaleString()}
                  </div>
                  <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                    {transaction.type}
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
