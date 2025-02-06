'use client';

import { createClient } from '@/lib/supabase/client';
import type { Training, TrainingEnrollment, TrainingStats } from '@/lib/types';
import { useEffect, useState } from 'react';

export function TrainingDashboard(): React.ReactElement {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [stats, setStats] = useState<TrainingStats>({
    totalEnrollments: 0,
    completedEnrollments: 0,
    averageProgress: 0,
    averageCompletionTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data: trainingData, error: trainingError } = await supabase
          .from('trainings')
          .select('*')
          .eq('status', 'active');

        if (trainingError) throw trainingError;

        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('training_enrollments')
          .select('*');

        if (enrollmentError) throw enrollmentError;

        setTrainings(trainingData as Training[]);
        setEnrollments(enrollmentData as TrainingEnrollment[]);
        calculateStats(trainingData as Training[], enrollmentData as TrainingEnrollment[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch training data'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading training data...</div>;
  }

  if (error) {
    return <div>Error loading training data: {error.message}</div>;
  }

  const calculateStats = (trainings: Training[], enrollments: TrainingEnrollment[]): void => {
    const totalCourses = trainings.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;
    const totalEnrollments = enrollments.length;

    // Calculate average progress for completed enrollments
    const averageProgress = enrollments
      .filter(e => e.status === 'completed')
      .reduce((acc, e) => acc + e.progress, 0) / (completed || 1);

    setStats({
      totalEnrollments,
      completedEnrollments: completed,
      averageProgress,
      averageCompletionTime: 0 // This value is not calculated in the original code
    });
  };

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const getStatusColor = (status: TrainingEnrollment['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Completion Rate</h3>
          <p className="text-2xl font-bold">{formatPercent(stats.averageProgress)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Average Progress</h3>
          <p className="text-2xl font-bold">{stats.averageProgress}%</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Active Courses</h3>
          <p className="text-2xl font-bold">{stats.totalEnrollments}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalEnrollments - stats.completedEnrollments}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completedEnrollments}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Failed</h3>
          <p className="text-2xl font-bold text-red-600">{stats.totalEnrollments - stats.completedEnrollments}</p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow">
        <h3 className="p-4 text-lg font-medium border-b">Active Training Courses</h3>
        <div className="divide-y">
          {trainings.map((training) => {
            const courseEnrollments = enrollments.filter(e => e.trainingId === training.id);
            const completedCount = courseEnrollments.filter(e => e.status === 'completed').length;
            const totalCount = courseEnrollments.length;
            const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <div key={training.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{training.title}</p>
                  <p className="text-sm text-muted-foreground">{training.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPercent(completionRate)} Complete</p>
                  <p className="text-sm text-muted-foreground">
                    {completedCount} / {totalCount} Enrolled
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
