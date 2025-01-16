'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, LineChart, chartColors } from '@/components/ui/charts'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { useSupabaseQuery } from '@/lib/hooks/use-query-with-supabase'
import type { DateRange } from 'react-day-picker'

interface ComplianceRecord {
  id: string
  type: string
  status: 'compliant' | 'non_compliant' | 'pending'
  due_date: string
  completed_date?: string
  risk_level: 'low' | 'medium' | 'high'
}

export function ComplianceDashboard() {
  const [dateRange, setDateRange] = React.useState<DateRange>()
  
  const { data: records, isLoading } = useSupabaseQuery<ComplianceRecord>({
    queryKey: ['compliance-records'],
    table: 'compliance_records',
  })

  const stats = React.useMemo(() => {
    if (!records) return {
      total: 0,
      compliant: 0,
      nonCompliant: 0,
      pending: 0,
      complianceRate: 0,
      highRisk: 0,
    }

    const filtered = records.filter(record => {
      if (!dateRange?.from || !dateRange?.to) return true
      const date = new Date(record.due_date)
      return date >= dateRange.from && date <= dateRange.to
    })

    const compliant = filtered.filter(r => r.status === 'compliant').length
    const nonCompliant = filtered.filter(r => r.status === 'non_compliant').length
    const pending = filtered.filter(r => r.status === 'pending').length
    const highRisk = filtered.filter(r => r.risk_level === 'high').length
    const total = filtered.length

    return {
      total,
      compliant,
      nonCompliant,
      pending,
      complianceRate: total ? (compliant / total) * 100 : 0,
      highRisk,
    }
  }, [records, dateRange])

  const complianceTrend = React.useMemo(() => {
    if (!records) return { labels: [], rates: [] }

    const monthlyStats = records.reduce((acc, record) => {
      const month = record.due_date.slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, compliant: 0 }
      }
      acc[month].total++
      if (record.status === 'compliant') {
        acc[month].compliant++
      }
      return acc
    }, {} as Record<string, { total: number; compliant: number }>)

    const sorted = Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))

    return {
      labels: sorted.map(([month]) => month),
      rates: sorted.map(([, stats]) => 
        (stats.compliant / stats.total) * 100
      ),
    }
  }, [records])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Compliance Analytics</h2>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Compliance Rate</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.complianceRate.toFixed(1)}%
          </p>
          <div className="mt-2 flex gap-2">
            <Badge variant="success">{stats.compliant} Compliant</Badge>
            <Badge variant="destructive">{stats.nonCompliant} Non-Compliant</Badge>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Reviews</h3>
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">High Risk Items</h3>
          <p className="text-3xl font-bold text-red-600">{stats.highRisk}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Trend</h3>
          <LineChart
            height={300}
            data={{
              labels: complianceTrend.labels,
              datasets: [
                {
                  label: 'Compliance Rate',
                  data: complianceTrend.rates,
                  borderColor: chartColors.primary,
                  tension: 0.4,
                },
              ],
            }}
            options={{
              scales: {
                y: {
                  min: 0,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`,
                  },
                },
              },
            }}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <BarChart
            height={300}
            data={{
              labels: ['Low', 'Medium', 'High'],
              datasets: [
                {
                  label: 'Risk Level',
                  data: records?.reduce(
                    (acc, record) => {
                      const idx = ['low', 'medium', 'high'].indexOf(record.risk_level)
                      acc[idx]++
                      return acc
                    },
                    [0, 0, 0]
                  ) || [0, 0, 0],
                  backgroundColor: [
                    chartColors.success,
                    chartColors.warning,
                    chartColors.error,
                  ],
                },
              ],
            }}
          />
        </Card>
      </div>
    </div>
  )
}
