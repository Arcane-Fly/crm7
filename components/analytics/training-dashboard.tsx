import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Enrollment {
  id: string;
  status: 'completed' | 'in_progress' | 'not_started';
  completedAt?: string;
}

interface EnrollmentResponse {
  data: Enrollment[];
  count: number;
}

export function TrainingDashboard(): void {
  const { data: enrollments } = useQuery<EnrollmentResponse>({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const response = await fetch('/api/enrollments');
      return response.json();
    },
  });

  const stats = React.useMemo(() => {
    if (!enrollments?.data)
      return {
        totalEnrollments: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        completionRate: 0,
      };

    const total = enrollments.data.length;
    const completed = enrollments.data.filter((e: unknown) => e.status === 'completed').length;
    const inProgress = enrollments.data.filter((e: unknown) => e.status === 'in_progress').length;
    const notStarted = enrollments.data.filter((e: unknown) => e.status === 'not_started').length;
    const completionRate = (completed / total) * 100;

    return {
      totalEnrollments: total,
      completed,
      inProgress,
      notStarted,
      completionRate,
    };
  }, [enrollments]);

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalEnrollments}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.completionRate.toFixed(1: unknown)}%</div>
          <Progress
            value={stats.completionRate}
            className='mt-2'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.inProgress}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Not Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.notStarted}</div>
        </CardContent>
      </Card>
    </div>
  );
}
