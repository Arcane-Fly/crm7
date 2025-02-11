import type { CacheMetrics, WarmingStats } from '@/lib/types/monitoring';
import { useEffect, useState } from 'react';
import type { Card } from '../ui';
import type { metrics } from '@/lib/utils/metrics';

export function CacheMetricsDashboard(): React.ReactElement {
  useState<CacheMetrics[]>([]);
  const [warmingStats, setWarmingStats] = useState<WarmingStats | null>(null);

  useEffect(() => {
    const fetchMetrics = async (): Promise<void> => {
      try {
        const response = await fetch('/api/monitoring/cache');
        const data = await response.json();
        setMetrics(data.metrics);
        setWarmingStats(data.warmingStats);
      } catch (error) {
        console.error('Failed to fetch cache metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return (): void => clearInterval(interval);
  }, []);

  if (!metrics.length) {
    return <div>Loading metrics...</div>;
  }

  const { p95, p99, avgLatency, hitRate } = calculateMetrics(metrics);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium">P95 Latency</h3>
          <p className="text-2xl font-bold">{p95}ms</p>
        </div>
      </Card>
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium">P99 Latency</h3>
          <p className="text-2xl font-bold">{p99}ms</p>
        </div>
      </Card>
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium">Average Latency</h3>
          <p className="text-2xl font-bold">{avgLatency}ms</p>
        </div>
      </Card>
      <Card>
        <div className="p-4">
          <h3 className="text-sm font-medium">Cache Hit Rate</h3>
          <p className="text-2xl font-bold">{hitRate}%</p>
        </div>
      </Card>
    </div>
  );
}
