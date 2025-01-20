import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { useQueryWithSupabase } from '@/lib/hooks/use-query-with-supabase'
import type { DateRange } from 'react-day-picker'

interface ComplianceRecord {
  id: string
  date: string
  type: string
  status: 'compliant' | 'non-compliant'
  details: string
}

export function ComplianceDashboard() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })

  const queryKey = ['compliance']
  if (date?.from) queryKey.push(date.from.toISOString())
  if (date?.to) queryKey.push(date.to.toISOString())

  const { data: complianceRecords = [] } = useQueryWithSupabase<ComplianceRecord>({
    queryKey,
    table: 'compliance_records',
    filter: date
      ? [
          { column: 'date', value: date.from?.toISOString() },
          { column: 'date', value: date.to?.toISOString() },
        ]
      : undefined,
  })

  const complianceRate = complianceRecords.length
    ? (complianceRecords.filter((r) => r.status === 'compliant').length /
        complianceRecords.length) *
      100
    : 0

  const chartData = complianceRecords.reduce(
    (acc, record) => {
      const date = format(new Date(record.date), 'MM/dd')
      const existing = acc.find((d) => d.date === date)
      if (existing) {
        existing.total += 1
        if (record.status === 'compliant') existing.compliant += 1
      } else {
        acc.push({
          date,
          total: 1,
          compliant: record.status === 'compliant' ? 1 : 0,
        })
      }
      return acc
    },
    [] as { date: string; total: number; compliant: number }[]
  )

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>Compliance Dashboard</h2>
        <DatePickerWithRange date={date} onDateChange={setDate} />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Overall Compliance Rate</CardTitle>
            <CardDescription>Percentage of compliant records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{complianceRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Records</CardTitle>
            <CardDescription>Number of compliance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{complianceRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Non-Compliant Records</CardTitle>
            <CardDescription>Records requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {complianceRecords.filter((r) => r.status === 'non-compliant').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Trend</CardTitle>
          <CardDescription>Historical view of compliance rates</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart width={800} height={400} data={chartData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type='monotone' dataKey='compliant' stroke='#10b981' name='Compliant Records' />
            <Line type='monotone' dataKey='total' stroke='#6366f1' name='Total Records' />
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
          <CardDescription>Latest compliance records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {complianceRecords.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <div className='font-medium'>{record.type}</div>
                  <div className='text-sm text-muted-foreground'>
                    {format(new Date(record.date), 'PPP')}
                  </div>
                </div>
                <Badge variant={record.status === 'compliant' ? 'default' : 'destructive'}>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
