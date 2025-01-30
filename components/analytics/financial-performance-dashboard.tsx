import { type ReactElement, useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/database';
import type { Performance } from '@/lib/types/hr';

interface PerformanceStats {
  totalReviews: number;
  averageRating: number;
  draftCount: number;
  submittedCount: number;
  approvedCount: number;
  completionRate: number;
}

export function FinancialPerformanceDashboard(): ReactElement {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    totalReviews: 0,
    averageRating: 0,
    draftCount: 0,
    submittedCount: 0,
    approvedCount: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const { data, error } = await supabase
          .from<
            'financial_transactions',
            Database['public']['Tables']['financial_transactions']['Row']
          >('financial_transactions')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        if (data) {
          setPerformances(data);
          calculateStats(data);
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        // setLoading(false); // You might need to add a loading state
      }
    };

    void fetchPerformanceData();
  }, [supabase]);

  const calculateStats = (performances: Performance[]) => {
    const totalReviews = performances.length;
    const averageRating =
      performances.length > 0
        ? performances.reduce((sum, p) => sum + p.rating, 0) / totalReviews
        : 0;
    const draftCount = performances.filter((p) => p.status === 'draft').length;
    const submittedCount = performances.filter((p) => p.status === 'submitted').length;
    const approvedCount = performances.filter((p) => p.status === 'approved').length;
    const completionRate = totalReviews > 0 ? (approvedCount / totalReviews) * 100 : 0;

    setStats({
      totalReviews,
      averageRating,
      draftCount,
      submittedCount,
      approvedCount,
      completionRate,
    });
  };

  const getStatusColor = (status: Performance['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'submitted':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Current performance metrics and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='grid grid-cols-4 gap-4'>
              <div>
                <p className='text-sm font-medium'>Total Reviews</p>
                <p className='text-2xl font-bold'>{stats.totalReviews}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Average Rating</p>
                <p className='text-2xl font-bold'>{stats.averageRating.toFixed(1)}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Approved Reviews</p>
                <p className='text-2xl font-bold text-green-600'>{stats.approvedCount}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Pending Reviews</p>
                <p className='text-2xl font-bold text-yellow-600'>{stats.submittedCount}</p>
              </div>
            </div>

            <div>
              <p className='mb-2 text-sm font-medium'>Review Completion Rate</p>
              <Progress
                value={stats.completionRate}
                className='w-full'
              />
              <p className='mt-1 text-sm text-gray-500'>{stats.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>Latest performance reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {performances.slice(0, 5).map((performance: Performance) => (
              <div
                key={performance.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <h4 className='font-medium'>Performance Review</h4>
                  <p className='text-sm text-gray-500'>Period: {performance.period}</p>
                </div>
                <div className='flex items-center space-x-4'>
                  <p className='font-medium'>Rating: {performance.rating.toFixed(1)}</p>
                  <Badge className={getStatusColor(performance.status)}>{performance.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
