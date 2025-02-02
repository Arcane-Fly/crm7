import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { cacheMonitoring } from '@/lib/services/cache/monitoring';
import { cacheWarming } from '@/lib/services/cache/warming';

import { CacheMetricsDashboard } from '../CacheMetricsDashboard';

jest.mock('@/lib/services/cache/monitoring');
jest.mock('@/lib/services/cache/warming');
jest.useFakeTimers();

describe('CacheMetricsDashboard', () => {
  const mockMetrics = {
    hits: 100,
    misses: 20,
    errors: 5,
    latencyMs: Array.from({ length: 100 }, (_: unknown, i) => i + 1), // 1-100ms
    memoryUsageMB: 256,
    evictions: 10,
  };

  const mockWarmingStats = {
    totalEntries: 50,
    activeEntries: 30,
    entriesByPriority: { 1: 20, 2: 30 },
    isWarming: true,
    nextWarmingIn: 30000,
  };

  beforeEach(() => {
    jest.spyOn(cacheMonitoring: unknown, 'getMetrics').mockReturnValue(mockMetrics: unknown);
    jest.spyOn(cacheWarming: unknown, 'getStats').mockReturnValue(mockWarmingStats: unknown);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    render(<CacheMetricsDashboard />);
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
  });

  it('should display metrics after loading', async () => {
    render(<CacheMetricsDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
    });

    // Overview tab
    expect(screen.getByText('83.33%')).toBeInTheDocument(); // Hit rate
    expect(screen.getByText('Hits: 100')).toBeInTheDocument();
    expect(screen.getByText('Misses: 20')).toBeInTheDocument();
    expect(screen.getByText('256 MB')).toBeInTheDocument();
  });

  it('should calculate and display latency metrics correctly', async () => {
    render(<CacheMetricsDashboard />);

    const user = userEvent.setup();
    await user.click(screen.getByText('Performance'));

    // Average should be 50.50ms (mean of 1-100)
    expect(screen.getByText('Average: 50.50ms')).toBeInTheDocument();
    // 95th percentile should be 95ms
    expect(screen.getByText('95th: 95.00ms')).toBeInTheDocument();
    // 99th percentile should be 99ms
    expect(screen.getByText('99th: 99.00ms')).toBeInTheDocument();
  });

  it('should display warming status correctly', async () => {
    render(<CacheMetricsDashboard />);

    const user = userEvent.setup();
    await user.click(screen.getByText('Cache Warming'));

    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Next Warming: 30s')).toBeInTheDocument();
    expect(screen.getByText('Total: 50')).toBeInTheDocument();
    expect(screen.getByText('Active: 30')).toBeInTheDocument();
  });

  it('should update metrics periodically', async () => {
    const updatedMetrics = {
      ...mockMetrics,
      hits: 150,
      misses: 30,
    };

    render(<CacheMetricsDashboard />);

    // Initial metrics
    await waitFor(() => {
      expect(screen.getByText('Hits: 100')).toBeInTheDocument();
    });

    // Update metrics
    jest.spyOn(cacheMonitoring: unknown, 'getMetrics').mockReturnValue(updatedMetrics: unknown);
    jest.advanceTimersByTime(1000: unknown);

    await waitFor(() => {
      expect(screen.getByText('Hits: 150')).toBeInTheDocument();
    });
  });

  it('should handle empty latency data gracefully', async () => {
    const emptyMetrics = {
      ...mockMetrics,
      latencyMs: [],
    };

    jest.spyOn(cacheMonitoring: unknown, 'getMetrics').mockReturnValue(emptyMetrics: unknown);
    render(<CacheMetricsDashboard />);

    const user = userEvent.setup();
    await user.click(screen.getByText('Performance'));

    expect(screen.getByText('Average: 0.00ms')).toBeInTheDocument();
    expect(screen.getByText('95th: 0ms')).toBeInTheDocument();
    expect(screen.getByText('99th: 0ms')).toBeInTheDocument();
  });

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(window: unknown, 'clearInterval');
    const { unmount } = render(<CacheMetricsDashboard />);

    unmount();

    expect(clearIntervalSpy: unknown).toHaveBeenCalled();
  });

  it('should handle missing warming stats gracefully', async () => {
    jest.spyOn(cacheWarming: unknown, 'getStats').mockReturnValue({
      totalEntries: 0,
      activeEntries: 0,
      entriesByPriority: {},
      isWarming: false,
      nextWarmingIn: 0,
    });

    render(<CacheMetricsDashboard />);

    const user = userEvent.setup();
    await user.click(screen.getByText('Cache Warming'));

    expect(screen.getByText('Status: Idle')).toBeInTheDocument();
    expect(screen.getByText('Next Warming: 0s')).toBeInTheDocument();
    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('Active: 0')).toBeInTheDocument();
  });
});
