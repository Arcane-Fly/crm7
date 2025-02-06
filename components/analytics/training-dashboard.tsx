'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Training, TrainingEnrollment, TrainingStats } from '@/lib/types';

export function TrainingDashboard(): React.ReactElement {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([]);
  const [stats, setStats] = useState<TrainingStats>({
    completionRate: 0,
    averageScore: 0,
    totalCourses: 0,
    inProgressCount: 0,
    completedCount: 0,
    failedCount: 0
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
    const failed = enrollments.filter(e => e.status === 'failed').length;
    const totalEnrollments = enrollments.length;

    const scores = enrollments
      .filter(e => e.status === 'completed' && typeof e.score === 'number')
      .map(e => e.score as number);
    
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    setStats({
      completionRate: totalEnrollments > 0 ? (completed / totalEnrollments) * 100 : 0,
      averageScore,
      totalCourses,
      inProgressCount: inProgress,
      completedCount: completed,
      failedCount: failed
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
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Completion Rate</h3>
          <p className="text-2xl font-bold">{formatPercent(stats.completionRate)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Average Score</h3>
          <p className="text-2xl font-bold">{formatPercent(stats.averageScore)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Active Courses</h3>
          <p className="text-2xl font-bold">{stats.totalCourses}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgressCount}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Completed</h3>
          <p className="text-2xl font-bold text-green-600">{stats.completedCount}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Failed</h3>
          <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
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
                  <p className="text-sm text-muted-foreground">{training.category}</p>
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
