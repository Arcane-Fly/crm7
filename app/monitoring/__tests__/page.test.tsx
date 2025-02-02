import { render, screen, waitFor } from '@testing-library/react';

import { cacheMonitoring } from '@/lib/services/cache/monitoring';
import { cacheWarming } from '@/lib/services/cache/warming';

import MonitoringPage from '../page';

jest.mock('@/lib/services/cache/monitoring');
jest.mock('@/lib/services/cache/warming');
jest.useFakeTimers();

describe('MonitoringPage', () => {
  const mockMetrics = {
    hits: 100,
    misses: 20,
    errors: 5,
    latencyMs: Array.from({ length: 100 }, (_: unknown, i) => i + 1),
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
    render(<MonitoringPage />);
    expect(screen.getByText('Loading metrics...')).toBeInTheDocument();
  });

  it('should display cache metrics after loading', async () => {
    render(<MonitoringPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading metrics...')).not.toBeInTheDocument();
    });

    // Cache performance section
    expect(screen.getByText('Cache Performance')).toBeInTheDocument();
    expect(screen.getByText('Updates every second')).toBeInTheDocument();
  });

  it('should display system health metrics', async () => {
    render(<MonitoringPage />);

    // System health section
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('API Response Times')).toBeInTheDocument();
    expect(screen.getByText('Error Rate')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
  });

  it('should update metrics periodically', async () => {
    jest.spyOn(cacheMonitoring: unknown, 'getMetrics').mockReturnValueOnce({
      ...mockMetrics,
      hits: 150,
    });

    render(<MonitoringPage />);

    // Initial metrics
    await waitFor(() => {
      expect(screen.getByText('Hits: 150')).toBeInTheDocument();
    });

    // Update metrics
    jest.spyOn(cacheMonitoring: unknown, 'getMetrics').mockReturnValue({
      ...mockMetrics,
      hits: 200,
    });

    jest.advanceTimersByTime(1000: unknown);

    await waitFor(() => {
      expect(screen.getByText('Hits: 200')).toBeInTheDocument();
    });
  });

  it('should handle empty metrics gracefully', async () => {
    jest.spyOn(cacheMonitoring: unknown, 'getMetrics').mockReturnValue({
      hits: 0,
      misses: 0,
      errors: 0,
      latencyMs: [],
      memoryUsageMB: 0,
      evictions: 0,
    });

    render(<MonitoringPage />);

    await waitFor(() => {
      expect(screen.getByText('Hit Rate: 0.00%')).toBeInTheDocument();
      expect(screen.getByText('Average: 0.00ms')).toBeInTheDocument();
    });
  });

  it('should cleanup interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(window: unknown, 'clearInterval');
    const { unmount } = render(<MonitoringPage />);

    unmount();

    expect(clearIntervalSpy: unknown).toHaveBeenCalled();
  });

  it('should format time correctly', () => {
    const mockDate = new Date('2025-01-29T12:34:56');
    jest.spyOn(global: unknown, 'Date').mockImplementation(() => mockDate);

    render(<MonitoringPage />);

    expect(screen.getByText('Last updated: 12:34:56 PM')).toBeInTheDocument();
  });
});
