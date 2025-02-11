import MonitoringPage from '@/app/monitoring/page';
import { cacheMonitoring } from '@/lib/services/cache/monitoring';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/services/cache/monitoring');

describe('MonitoringPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders monitoring metrics', () => {
    const mockMetrics = {
      hitRate: '75.00%',
      totalRequests: 100,
      latency: {
        avg: '20.00ms',
        p95: '100.00ms',
        p99: '150.00ms',
      }
    };

    jest.spyOn(cacheMonitoring, 'getMetrics').mockReturnValue(mockMetrics);
    render(<MonitoringPage />);
    expect(screen.getByText('Cache Hit Rate: 75.00%')).toBeInTheDocument();
    expect(screen.getByText('Total Requests: 100')).toBeInTheDocument();
    expect(screen.getByText('Average Latency: 20.00ms')).toBeInTheDocument();
  });
});
