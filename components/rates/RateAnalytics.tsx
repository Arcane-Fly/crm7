'use client';

import { useState, useEffect } from 'react';

import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Alert } from '@/components/ui/alert';
import type { AnalyticsData } from '@/lib/services/rates';
import { ratesService } from '@/lib/services/rates';
import type { RateAnalytics } from '@/lib/types/rates';

interface RateAnalyticsProps {
  orgId: string;
}

export function RateAnalytics({ orgId }: RateAnalyticsProps): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ratesService.getAnalytics({ orgId });
        const result = response as { data: AnalyticsData };
        setAnalytics(result.data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, [orgId]);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (error) {
    return <Alert variant='destructive'>{error}</Alert>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <ErrorBoundary>
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold'>Rate Analytics</h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h3 className='mb-2 text-lg font-semibold'>Average Rate</h3>
            <p className='text-3xl font-bold'>${analytics.averageRate.toFixed(2)}</p>
          </div>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h3 className='mb-2 text-lg font-semibold'>Templates</h3>
            <p className='text-sm'>
              Active: {analytics.activeTemplates} / Total: {analytics.totalTemplates}
            </p>
          </div>
          <div className='rounded-lg bg-white p-6 shadow'>
            <h3 className='mb-2 text-lg font-semibold'>Recent Changes</h3>
            <div className='space-y-2'>
              {analytics.recentChanges.slice(0, 3).map((change, index) => (
                <p
                  key={index}
                  className='text-sm'
                >
                  {change.description} on {new Date(change.date).toLocaleDateString()}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
