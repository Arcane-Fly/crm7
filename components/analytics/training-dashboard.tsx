'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import type { TrainingStats } from '@/lib/types';

interface TrainingDashboardProps {
  data?: {
    completed: number;
    totalCourses: number;
    inProgress: number;
  };
}

export function TrainingDashboard({ data }: TrainingDashboardProps) {
  const [stats, setStats] = useState<TrainingStats>({
    totalEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    averageCompletionTime: 0,
  });
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('training_enrollments')
          .select('*');

        if (enrollmentError) throw enrollmentError;

        const totalEnrollments = enrollmentData.length;
        const completedEnrollments = enrollmentData.filter(e => e.status === 'completed').length;

        setStats({
          totalEnrollments,
          completedEnrollments,
          averageProgress: 0,
          averageCompletionTime: 0
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch training data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading training data...</div>;
  }

  if (error) {
    return <div>Error loading training data: {error.message}</div>;
  }

  const progressPercentage = (stats.completedEnrollments / stats.totalEnrollments) * 100;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Training Progress</h2>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Completed</h3>
            <p className="text-3xl font-bold text-green-500">{stats.completedEnrollments}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Courses</h3>
            <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
