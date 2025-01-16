'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { LineChart, PieChart, chartColors } from '@/components/ui/charts'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useSupabaseQuery } from '@/lib/hooks/use-query-with-supabase'
import type { DateRange } from 'react-day-picker'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'

interface Employee {
  id: string
  status: 'active' | 'terminated' | 'on_leave'
  department: string
  start_date: string
  end_date?: string
  role: string
}

export function HRDashboard() {
  const [dateRange, setDateRange] = React.useState<DateRange>()
  
  const { data: employees, isLoading } = useSupabaseQuery<Employee>({
    queryKey: ['employees'],
    table: 'employees',
  })

  const stats = React.useMemo(() => {
    if (!employees) return {
      total: 0,
      active: 0,
      onLeave: 0,
      terminated: 0,
      retentionRate: 0,
    }

    const filtered = employees.filter(employee => {
      if (!dateRange?.from || !dateRange?.to) return true
      const startDate = new Date(employee.start_date)
      return startDate >= dateRange.from && startDate <= dateRange.to
    })

    const active = filtered.filter(e => e.status === 'active').length
    const onLeave = filtered.filter(e => e.status === 'on_leave').length
    const terminated = filtered.filter(e => e.status === 'terminated').length
    const total = filtered.length

    const retentionRate = total ? ((active + onLeave) / total) * 100 : 0

    return {
      total,
      active,
      onLeave,
      terminated,
      retentionRate,
    }
  }, [employees, dateRange])

  const departmentStats = React.useMemo(() => {
    if (!employees) return { labels: [], counts: [] }

    const departments = employees.reduce((acc, employee) => {
      acc[employee.department] = (acc[employee.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      labels: Object.keys(departments),
      counts: Object.values(departments),
    }
  }, [employees])

  const turnoverTrend = React.useMemo(() => {
    if (!employees) return { labels: [], rates: [] }

    const monthlyStats = employees.reduce((acc, employee) => {
      const startMonth = employee.start_date.slice(0, 7) // YYYY-MM
      if (!acc[startMonth]) {
        acc[startMonth] = { joined: 0, left: 0 }
      }
      acc[startMonth].joined++
      
      if (employee.end_date) {
        const endMonth = employee.end_date.slice(0, 7)
        if (!acc[endMonth]) {
          acc[endMonth] = { joined: 0, left: 0 }
        }
        acc[endMonth].left++
      }
      
      return acc
    }, {} as Record<string, { joined: number; left: number }>)

    const sorted = Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))

    return {
      labels: sorted.map(([month]) => month),
      joined: sorted.map(([, stats]) => stats.joined),
      left: sorted.map(([, stats]) => stats.left),
    }
  }, [employees])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">HR Analytics</h2>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Employees</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Active</h3>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">On Leave</h3>
            <p className="text-3xl font-bold text-amber-600">{stats.onLeave}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Retention Rate</h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.retentionRate.toFixed(1)}%
            </p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
            <PieChart
              height={300}
              data={{
                labels: departmentStats.labels,
                datasets: [
                  {
                    data: departmentStats.counts,
                    backgroundColor: [
                      chartColors.primary,
                      chartColors.secondary,
                      chartColors.success,
                      chartColors.warning,
                      chartColors.error,
                    ],
                  },
                ],
              }}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Employee Turnover</h3>
            <LineChart
              height={300}
              data={{
                labels: turnoverTrend.labels,
                datasets: [
                  {
                    label: 'Joined',
                    data: turnoverTrend.joined,
                    borderColor: chartColors.success,
                    tension: 0.4,
                  },
                  {
                    label: 'Left',
                    data: turnoverTrend.left,
                    borderColor: chartColors.error,
                    tension: 0.4,
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
