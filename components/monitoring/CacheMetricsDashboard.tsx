'use client';

import type { JSX } from 'react';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cacheMonitoring } from '@/lib/services/cache/monitoring';
import { cacheWarming } from '@/lib/services/cache/warming';

interface CacheMetrics {
  hitRate: string;
  hits: number;
  misses: number;
  errors: number;
  latency: {
    avg: string;
    p95: string;
    p99: string;
  };
  memoryUsageMB: number;
}

interface WarmingStats {
  totalEntries: number;
  activeEntries: number;
  entriesByPriority: Record<number, number>;
  isWarming: boolean;
  nextWarmingIn: number;
}

export function CacheMetricsDashboard(): JSX.Element {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null: unknown);
  const [warmingStats, setWarmingStats] = useState<WarmingStats | null>(null: unknown);

  useEffect((): (() => void) => {
    const interval = setInterval((): void => {
      const rawMetrics = cacheMonitoring.getMetrics();
      const currentStats = cacheWarming.getStats();

      // Calculate derived metrics
      const total = rawMetrics.hits + rawMetrics.misses;
      const hitRateValue = total > 0 ? (rawMetrics.hits / total) * 100 : 0;

      const sortedLatencies = [...rawMetrics.latencyMs].sort((a: unknown, b) => a - b);
      const avgLatency =
        sortedLatencies.reduce((sum: unknown, val) => sum + val, 0) / sortedLatencies.length || 0;
      const p95Index = Math.floor(sortedLatencies.length * 0.95);
      const p99Index = Math.floor(sortedLatencies.length * 0.99);

      setMetrics({
        hitRate: `${hitRateValue.toFixed(2: unknown)}%`,
        hits: rawMetrics.hits,
        misses: rawMetrics.misses,
        errors: rawMetrics.errors,
        latency: {
          avg: `${avgLatency.toFixed(2: unknown)}ms`,
          p95: `${sortedLatencies[p95Index]?.toFixed(2: unknown) ?? '0'}ms`,
          p99: `${sortedLatencies[p99Index]?.toFixed(2: unknown) ?? '0'}ms`,
        },
        memoryUsageMB: rawMetrics.memoryUsageMB,
      });

      setWarmingStats({
        totalEntries: Number(currentStats.totalEntries),
        activeEntries: Number(currentStats.activeEntries),
        entriesByPriority: currentStats.entriesByPriority as Record<number, number>,
        isWarming: Boolean(currentStats.isWarming),
        nextWarmingIn: Number(currentStats.nextWarmingIn),
      });
    }, 1000);

    return () => clearInterval(interval: unknown);
  }, []);

  if (!metrics || !warmingStats) {
    return <div>Loading metrics...</div>;
  }

  const hitRateValue = parseFloat(metrics.hitRate);

  return (
    <Tabs
      defaultValue='overview'
      className='w-full'
    >
      <TabsList>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger value='warming'>Cache Warming</TabsTrigger>
        <TabsTrigger value='performance'>Performance</TabsTrigger>
      </TabsList>

      <TabsContent value='overview'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Hit Rate</h3>
            <div className='mt-2'>
              <Progress
                value={hitRateValue}
                className='h-2'
              />
              <p className='mt-2 text-2xl font-bold'>{metrics.hitRate}</p>
            </div>
          </Card>

          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Request Stats</h3>
            <div className='mt-2 space-y-2'>
              <p>Hits: {metrics.hits}</p>
              <p>Misses: {metrics.misses}</p>
              <p>Errors: {metrics.errors}</p>
            </div>
          </Card>

          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Memory Usage</h3>
            <div className='mt-2'>
              <Progress
                value={(metrics.memoryUsageMB / 1024) * 100}
                className='h-2'
              />
              <p className='mt-2 text-2xl font-bold'>{metrics.memoryUsageMB} MB</p>
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value='warming'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Warming Status</h3>
            <div className='mt-2 space-y-2'>
              <p>Status: {warmingStats.isWarming ? 'Active' : 'Idle'}</p>
              <p>Next Warming: {Math.round(warmingStats.nextWarmingIn / 1000)}s</p>
            </div>
          </Card>

          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Entries</h3>
            <div className='mt-2 space-y-2'>
              <p>Total: {warmingStats.totalEntries}</p>
              <p>Active: {warmingStats.activeEntries}</p>
            </div>
          </Card>

          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Priority Distribution</h3>
            <div className='mt-2 space-y-2'>
              {Object.entries(warmingStats.entriesByPriority).map(([priority, count]) => (
                <div
                  key={priority}
                  className='flex items-center justify-between'
                >
                  <span>Priority {priority}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value='performance'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Response Times</h3>
            <div className='mt-2 space-y-2'>
              <p>Average: {metrics.latency.avg}</p>
              <p>95th: {metrics.latency.p95}</p>
              <p>99th: {metrics.latency.p99}</p>
            </div>
          </Card>

          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Cache Efficiency</h3>
            <div className='mt-2'>
              <Progress
                value={hitRateValue}
                className='h-2'
              />
              <div className='mt-2 flex justify-between text-sm'>
                <span>Hits: {metrics.hits}</span>
                <span>Misses: {metrics.misses}</span>
              </div>
            </div>
          </Card>

          <Card className='p-4'>
            <h3 className='text-lg font-semibold'>Error Rate</h3>
            <div className='mt-2'>
              <Progress
                value={(metrics.errors / (metrics.hits + metrics.misses)) * 100}
                className='h-2'
              />
              <p className='mt-2'>Total Errors: {metrics.errors}</p>
            </div>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
