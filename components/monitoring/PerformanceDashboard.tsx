import { type PerformanceMetrics } from '@/lib/types';

interface PerformanceDashboardProps {
  metrics: PerformanceMetrics;
}

export function PerformanceDashboard({ metrics }: PerformanceDashboardProps): JSX.Element {
  const formatChartData = (metrics: PerformanceMetrics) => {
    // Chart data formatting implementation
  };

  const chartData = formatChartData(metrics);
  const { pageLoadStats, memoryStats, networkRequestStats } = metrics;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="text-lg font-medium">Page Load Time</h3>
        <div className="mt-2">
          <p>Average: {pageLoadStats.avg.toFixed(2)}</p>
          <p>Min: {pageLoadStats.min.toFixed(2)}</p>
          <p>Max: {pageLoadStats.max.toFixed(2)}</p>
          <p>95th Percentile: {pageLoadStats.p95.toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="text-lg font-medium">Memory Usage (MB)</h3>
        <div className="mt-2">
          <p>Average: {(memoryStats.avg / 1024 / 1024).toFixed(2)}</p>
          <p>Min: {(memoryStats.min / 1024 / 1024).toFixed(2)}</p>
          <p>Max: {(memoryStats.max / 1024 / 1024).toFixed(2)}</p>
          <p>95th Percentile: {(memoryStats.p95 / 1024 / 1024).toFixed(2)}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="text-lg font-medium">Network Requests</h3>
        <div className="mt-2">
          <p>Average: {networkRequestStats.avg.toFixed(2)}</p>
          <p>Min: {networkRequestStats.min.toFixed(2)}</p>
          <p>Max: {networkRequestStats.max.toFixed(2)}</p>
          <p>95th Percentile: {networkRequestStats.p95.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
