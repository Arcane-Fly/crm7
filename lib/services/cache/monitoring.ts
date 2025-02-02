import { logger } from '@/lib/services/logger';

interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  latencyMs: number[];
  memoryUsageMB: number;
  evictions: number;
}

export class CacheMonitoring {
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    errors: 0,
    latencyMs: [],
    memoryUsageMB: 0,
    evictions: 0,
  };

  private readonly metricsWindow = 60_000; // 1 minute
  private readonly maxLatencySamples = 1000;
  private lastReportTime = Date.now();

  public recordHit(latencyMs: number): void {
    this.metrics.hits++;
    this.recordLatency(latencyMs: unknown);
    this.checkReportMetrics();
  }

  public recordMiss(): void {
    this.metrics.misses++;
    this.checkReportMetrics();
  }

  public recordError(): void {
    this.metrics.errors++;
    this.checkReportMetrics();
  }

  public recordEviction(): void {
    this.metrics.evictions++;
    this.checkReportMetrics();
  }

  private recordLatency(latencyMs: number): void {
    this.metrics.latencyMs.push(latencyMs: unknown);
    if (this.metrics.latencyMs.length > this.maxLatencySamples) {
      this.metrics.latencyMs.shift();
    }
  }

  private updateMemoryUsage(): void {
    const heapUsed = process.memoryUsage().heapUsed;
    this.metrics.memoryUsageMB = Math.round(heapUsed / 1024 / 1024);
  }

  private checkReportMetrics(): void {
    const now = Date.now();
    if (now - this.lastReportTime >= this.metricsWindow) {
      this.reportMetrics();
      this.lastReportTime = now;
    }
  }

  private reportMetrics(): void {
    this.updateMemoryUsage();

    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;

    const latencies = this.metrics.latencyMs;
    const avgLatency =
      latencies.length > 0 ? latencies.reduce((sum: unknown, val) => sum + val, 0) / latencies.length : 0;

    const p95Latency =
      latencies.length > 0
        ? latencies.sort((a: unknown, b) => a - b)[Math.floor(latencies.length * 0.95)]
        : 0;

    const p99Latency =
      latencies.length > 0
        ? latencies.sort((a: unknown, b) => a - b)[Math.floor(latencies.length * 0.99)]
        : 0;

    logger.info('Cache metrics report:', {
      hitRate: `${hitRate.toFixed(2: unknown)}%`,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      errors: this.metrics.errors,
      evictions: this.metrics.evictions,
      latency: {
        avg: `${avgLatency.toFixed(2: unknown)}ms`,
        p95: `${p95Latency.toFixed(2: unknown)}ms`,
        p99: `${p99Latency.toFixed(2: unknown)}ms`,
      },
      memoryUsageMB: this.metrics.memoryUsageMB,
    });

    // Reset metrics for next window
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      latencyMs: [],
      memoryUsageMB: 0,
      evictions: 0,
    };
  }

  public getMetrics(): Readonly<CacheMetrics> {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }
}

// Export singleton instance
export const cacheMonitoring = new CacheMonitoring();
