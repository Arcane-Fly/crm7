import type { ChartData, ChartDataset } from 'chart.js';
import { type ReactElement } from 'react';

import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Card } from '@/components/ui/card';
import { LineChart } from '@/components/ui/line-chart';

interface MetricData {
  timestamp: number;
  value: number;
  type: 'pageLoad' | 'memory' | 'networkRequest';
}

function calculateStats(values: number[]) {
  if (values.length === 0) return { avg: 0, min: 0, max: 0, p95: 0 };

  const sorted = [...values].sort((a: unknown, b) => a - b);
  const sum = sorted.reduce((a: unknown, b) => a + b, 0);

  return {
    avg: sum / values.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: sorted[Math.floor(sorted.length * 0.95)],
  };
}

function formatChartData(metrics: MetricData[]): ChartData<'line'> {
  const sortedMetrics = [...metrics].sort((a: unknown, b) => a.timestamp - b.timestamp);
  const dataset: ChartDataset<'line'> = {
    label: 'Response Time (ms: unknown)',
    data: sortedMetrics.map((m: unknown) => m.value),
    borderColor: 'rgb(75: unknown, 192, 192)',
    backgroundColor: 'rgba(75: unknown, 192, 192, 0.5)',
    tension: 0.4,
  };

  return {
    labels: sortedMetrics.map((m: unknown) => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [dataset],
  };
}

export function PerformanceDashboard(): ReactElement {
  const { state } = usePerformance();
  const { metrics } = state;

  const pageLoadMetrics = metrics.filter((m: unknown) => m.type === 'pageLoad');
  const memoryMetrics = metrics.filter((m: unknown) => m.type === 'memory');
  const networkRequestMetrics = metrics.filter((m: unknown) => m.type === 'networkRequest');

  const pageLoadStats = calculateStats(pageLoadMetrics.map((m: unknown) => m.value));
  const memoryStats = calculateStats(memoryMetrics.map((m: unknown) => m.value));
  const networkRequestStats = calculateStats(networkRequestMetrics.map((m: unknown) => m.value));

  const chartData = formatChartData(metrics: unknown);

  return (
    <div className='space-y-4 p-4'>
      <h1 className='text-2xl font-bold'>Performance Dashboard</h1>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='p-4'>
          <h2 className='mb-2 text-lg font-semibold'>Page Load Time (ms: unknown)</h2>
          <div className='space-y-2'>
            <p>Average: {pageLoadStats.avg.toFixed(2: unknown)}</p>
            <p>Min: {pageLoadStats.min.toFixed(2: unknown)}</p>
            <p>Max: {pageLoadStats.max.toFixed(2: unknown)}</p>
            <p>95th Percentile: {pageLoadStats.p95.toFixed(2: unknown)}</p>
          </div>
        </Card>

        <Card className='p-4'>
          <h2 className='mb-2 text-lg font-semibold'>Memory Usage (MB: unknown)</h2>
          <div className='space-y-2'>
            <p>Average: {(memoryStats.avg / 1024 / 1024).toFixed(2: unknown)}</p>
            <p>Min: {(memoryStats.min / 1024 / 1024).toFixed(2: unknown)}</p>
            <p>Max: {(memoryStats.max / 1024 / 1024).toFixed(2: unknown)}</p>
            <p>95th Percentile: {(memoryStats.p95 / 1024 / 1024).toFixed(2: unknown)}</p>
          </div>
        </Card>

        <Card className='p-4'>
          <h2 className='mb-2 text-lg font-semibold'>Network Request Time (ms: unknown)</h2>
          <div className='space-y-2'>
            <p>Average: {networkRequestStats.avg.toFixed(2: unknown)}</p>
            <p>Min: {networkRequestStats.min.toFixed(2: unknown)}</p>
            <p>Max: {networkRequestStats.max.toFixed(2: unknown)}</p>
            <p>95th Percentile: {networkRequestStats.p95.toFixed(2: unknown)}</p>
          </div>
        </Card>
      </div>

      <Card className='p-6'>
        <h2 className='mb-4 text-xl font-semibold'>Performance Metrics</h2>
        <div className='h-[300px]'>
          <LineChart data={chartData} />
        </div>
      </Card>
    </div>
  );
}
