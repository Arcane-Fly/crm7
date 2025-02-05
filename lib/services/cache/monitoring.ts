interface CacheMetrics {
  hits: number;
  misses: number;
  latencyMs: number[];
}

class CacheMonitoring {
  private metrics: CacheMetrics;
  private readonly maxLatencySamples: number;

  constructor(maxLatencySamples = 1000) {
    this.maxLatencySamples = maxLatencySamples;
    this.resetMetrics();
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      latencyMs: [],
    };
  }

  recordHit(latencyMs: number): void {
    this.metrics.hits++;
    this.recordLatency(latencyMs);
  }

  recordMiss(latencyMs: number): void {
    this.metrics.misses++;
    this.recordLatency(latencyMs);
  }

  private recordLatency(latencyMs: number): void {
    this.metrics.latencyMs.push(latencyMs);

    if (this.metrics.latencyMs.length > this.maxLatencySamples) {
      this.metrics.latencyMs.shift();
    }
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b): number => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  getMetrics(): {
    hitRate: string;
    totalRequests: number;
    latency: {
      avg: string;
      p95: string;
      p99: string;
    };
  } {
    const total = this.metrics.hits + this.metrics.misses;
    const hitRate = total === 0 ? 0 : (this.metrics.hits / total) * 100;

    const latencies = this.metrics.latencyMs;
    const avgLatency = latencies.length === 0
      ? 0
      : latencies.reduce((sum, val) => sum + val, 0) / latencies.length;

    const p95Latency = this.calculatePercentile(latencies, 95);
    const p99Latency = this.calculatePercentile(latencies, 99);

    return {
      hitRate: `${hitRate.toFixed(2)}%`,
      totalRequests: total,
      latency: {
        avg: `${avgLatency.toFixed(2)}ms`,
        p95: `${p95Latency.toFixed(2)}ms`,
        p99: `${p99Latency.toFixed(2)}ms`,
      },
    };
  }
}

export const cacheMonitoring = new CacheMonitoring();
