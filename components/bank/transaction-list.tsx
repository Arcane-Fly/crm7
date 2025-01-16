'use client'

import * as React from 'react'
import { useBankIntegration } from '@/lib/hooks/use-bank-integration'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'

export function TransactionList() {
  const { transactions } = useBankIntegration()
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()
  const [accountFilter, _setAccountFilter] = React.useState<string>('')
  const [typeFilter, setTypeFilter] = React.useState<'credit' | 'debit' | ''>('')

  const columns = [
    {
      accessorKey: 'transaction_date',
      header: 'Date',
      cell: ({ row }: { row: any }) => formatDate(row.original.transaction_date),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: { row: any }) => {
        const amount = row.original.amount
        const type = row.original.type
        return (
          <span className={type === 'credit' ? 'text-green-600' : 'text-red-600'}>
            {type === 'credit' ? '+' : '-'}{formatCurrency(amount)}
          </span>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: { row: any }) => (
        <Badge
          variant={row.original.type === 'credit' ? 'success' : 'default'}
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => (
        <Badge
          variant={
            row.original.status === 'completed'
              ? 'success'
              : row.original.status === 'failed'
              ? 'destructive'
              : 'default'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
    },
  ]

  const filteredData = React.useMemo(() => {
    if (!transactions.data) return []

    return transactions.data.filter((transaction) => {
      const matchesAccount = !accountFilter || transaction.account_id === accountFilter
      const matchesType = !typeFilter || transaction.type === typeFilter
      const matchesDate = !dateRange?.from || !dateRange?.to || (
        new Date(transaction.transaction_date) >= dateRange.from &&
        new Date(transaction.transaction_date) <= dateRange.to
      )

      return matchesAccount && matchesType && matchesDate
    })
  }, [transactions.data, accountFilter, typeFilter, dateRange])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={typeFilter} onValueChange={(value: 'credit' | 'debit' | '') => setTypeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>

        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}

      />
    </div>
  )
}
