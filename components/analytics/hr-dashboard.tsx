import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { format } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Badge } from '@/components/ui/badge'
import { useQueryWithSupabase } from '@/lib/hooks/use-query-with-supabase'
import type { DateRange } from 'react-day-picker'

interface Employee {
  id: string
  name: string
  position: string
  department: string
  status: 'active' | 'inactive'
  hireDate: string
  salary: number
  performance: number
}

interface Attendance {
  id: string
  employeeId: string
  date: string
  status: 'present' | 'absent' | 'late'
  hoursWorked: number
}

export function HRDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  })

  const queryKey = ['employees']
  if (dateRange?.from) queryKey.push(dateRange.from.toISOString())
  if (dateRange?.to) queryKey.push(dateRange.to.toISOString())

  const { data: employees = [] } = useQueryWithSupabase<Employee>({
    queryKey,
    table: 'employees',
  })

  const { data: attendance = [] } = useQueryWithSupabase<Attendance>({
    queryKey: [
      'attendance',
      dateRange?.from ? dateRange.from.toISOString() : '',
      dateRange?.to ? dateRange.to.toISOString() : '',
    ],
    table: 'attendance',
    filter:
      dateRange?.from && dateRange?.to
        ? [
            { column: 'date', value: dateRange.from.toISOString() },
            { column: 'date', value: dateRange.to.toISOString() },
          ]
        : undefined,
  })

  const activeEmployees = employees.filter((e) => e.status === 'active')
  const totalEmployees = employees.length
  const averageSalary = employees.reduce((sum, emp) => sum + emp.salary, 0) / employees.length || 0
  const averagePerformance =
    employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length || 0

  const departmentStats = employees.reduce(
    (acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = { count: 0, totalSalary: 0, avgPerformance: 0 }
      }
      acc[emp.department].count++
      acc[emp.department].totalSalary += emp.salary
      acc[emp.department].avgPerformance += emp.performance
      return acc
    },
    {} as Record<string, { count: number; totalSalary: number; avgPerformance: number }>
  )

  const attendanceStats = attendance.reduce(
    (acc, record) => {
      const date = format(new Date(record.date), 'MM/dd')
      const existing = acc.find((d) => d.date === date)
      if (existing) {
        existing[record.status]++
        existing.hoursWorked += record.hoursWorked
      } else {
        acc.push({
          date,
          present: record.status === 'present' ? 1 : 0,
          absent: record.status === 'absent' ? 1 : 0,
          late: record.status === 'late' ? 1 : 0,
          hoursWorked: record.hoursWorked,
        })
      }
      return acc
    },
    [] as { date: string; present: number; absent: number; late: number; hoursWorked: number }[]
  )

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-3xl font-bold tracking-tight'>HR Dashboard</h2>
        <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Active and inactive staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {activeEmployees.length} / {totalEmployees}
            </div>
            <p className='text-sm text-muted-foreground'>Active / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Salary</CardTitle>
            <CardDescription>Per employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${averageSalary.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Score</CardTitle>
            <CardDescription>Average rating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{averagePerformance.toFixed(1)} / 5.0</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Active departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{Object.keys(departmentStats).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
          <CardDescription>Daily attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart width={800} height={400} data={attendanceStats}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis yAxisId='left' />
            <YAxis yAxisId='right' orientation='right' />
            <Tooltip />
            <Legend />
            <Line
              yAxisId='left'
              type='monotone'
              dataKey='present'
              stroke='#10b981'
              name='Present'
            />
            <Line yAxisId='left' type='monotone' dataKey='absent' stroke='#ef4444' name='Absent' />
            <Line yAxisId='left' type='monotone' dataKey='late' stroke='#f59e0b' name='Late' />
            <Line
              yAxisId='right'
              type='monotone'
              dataKey='hoursWorked'
              stroke='#6366f1'
              name='Hours Worked'
            />
          </LineChart>
        </CardContent>
      </Card>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
            <CardDescription>Statistics by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Object.entries(departmentStats).map(([dept, stats]) => (
                <div key={dept} className='flex items-center justify-between rounded-lg border p-4'>
                  <div>
                    <div className='font-medium'>{dept}</div>
                    <div className='text-sm text-muted-foreground'>
                      {stats.count} employees | Avg. Performance:{' '}
                      {(stats.avgPerformance / stats.count).toFixed(1)}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-medium'>
                      ${(stats.totalSalary / stats.count).toLocaleString()}
                    </div>
                    <div className='text-sm text-muted-foreground'>Avg. Salary</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Hires</CardTitle>
            <CardDescription>Latest employee additions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {employees
                .sort((a, b) => new Date(b.hireDate).getTime() - new Date(a.hireDate).getTime())
                .slice(0, 5)
                .map((employee) => (
                  <div
                    key={employee.id}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div>
                      <div className='font-medium'>{employee.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        {employee.position} - {employee.department}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='text-sm text-muted-foreground'>
                        {format(new Date(employee.hireDate), 'PPP')}
                      </div>
                      <Badge variant={employee.status === 'active' ? 'default' : 'destructive'}>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
