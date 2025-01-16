'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { BarChart, PieChart, chartColors } from '@/components/ui/charts'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { useLMS } from '@/lib/hooks/use-lms'
import type { DateRange } from 'react-day-picker'

export function TrainingDashboard() {
  const lms = useLMS()
  const { data: courses } = lms.useCourses()
  const { data: enrollments } = lms.useEnrollments()
  const [dateRange, setDateRange] = React.useState<DateRange>()

  const stats = React.useMemo(() => {
    if (!enrollments.data) return {
      totalEnrollments: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      completionRate: 0,
    }

    const filtered = enrollments.data.filter((enrollment: any) => {
      if (!dateRange?.from || !dateRange?.to) return true
      const date = new Date(enrollment.start_date)
      return date >= dateRange.from && date <= dateRange.to
    })

    const completed = filtered.filter((e: any) => e.status === 'completed').length
    const inProgress = filtered.filter((e: any) => e.status === 'in_progress').length
    const notStarted = filtered.filter((e: any) => e.status === 'enrolled').length
    const total = filtered.length

    return {
      totalEnrollments: total,
      completed,
      inProgress,
      notStarted,
      completionRate: total ? (completed / total) * 100 : 0,
    }
  }, [enrollments.data, dateRange])

  const courseStats = React.useMemo(() => {
    if (!courses.data || !enrollments.data) return {
      labels: [],
      enrollmentCounts: [],
      completionRates: [],
    }

    const stats = courses.data.map((course: any) => {
      const courseEnrollments = enrollments.data.filter((e: any) => e.course_id === course.id)
      const completed = courseEnrollments.filter((e: any) => e.status === 'completed').length
      const total = courseEnrollments.length

      return {
        name: course.title,
        enrollments: total,
        completionRate: total ? (completed / total) * 100 : 0,
      }
    })

    return {
      labels: stats.map((s: any) => s.name),
      enrollmentCounts: stats.map((s: any) => s.enrollments),
      completionRates: stats.map((s: any) => s.completionRate),
    }
  }, [courses.data, enrollments.data])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Training Analytics</h2>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Enrollments</h3>
          <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">In Progress</h3>
          <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-blue-600">
            {stats.completionRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Course Enrollments</h3>
          <BarChart
            height={300}
            data={{
              labels: courseStats.labels,
              datasets: [
                {
                  label: 'Enrollments',
                  data: courseStats.enrollmentCounts,
                  backgroundColor: chartColors.primary,
                },
              ],
            }}
            options={{
              indexAxis: 'y' as const,
            }}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Completion Status</h3>
          <PieChart
            height={300}
            data={{
              labels: ['Completed', 'In Progress', 'Not Started'],
              datasets: [
                {
                  data: [stats.completed, stats.inProgress, stats.notStarted],
                  backgroundColor: [
                    chartColors.success,
                    chartColors.warning,
                    chartColors.gray,
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
