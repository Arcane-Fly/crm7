'use client';

import { useState, useEffect } from 'react';
import { type RateAnalytics } from '@/lib/types/rates';
import { ratesService } from '@/lib/services/rates';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Alert } from '@/components/ui/alert';

interface RateAnalyticsProps {
  orgId: string;
}

export function RateAnalytics({ orgId }: RateAnalyticsProps): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<RateAnalytics | null>(null);

  useEffect((): void => {
    const loadAnalytics = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const response = await ratesService.getAnalytics({ orgId });
        setAnalytics(response.data);
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An error occurred';
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, [orgId]);

  if (typeof loading !== "undefined" && loading !== null) {
    return <div>Loading analytics...</div>;
  }

  if (typeof error !== "undefined" && error !== null) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Rate Analytics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Average Rate</h3>
            <p className="text-3xl font-bold">${analytics.averageRate.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Templates</h3>
            <p className="text-sm">
              Active: {analytics.activeTemplates} / Total: {analytics.totalTemplates}
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-2 text-lg font-semibold">Recent Changes</h3>
            <div className="space-y-2">
              {analytics.recentChanges.slice(0, 3).map((change, index) => (
                <p key={index} className="text-sm">
                  {change.action} on {new Date(change.timestamp).toLocaleDateString()}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
