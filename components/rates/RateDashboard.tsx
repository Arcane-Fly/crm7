'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { subDays, format, isValid } from 'date-fns';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import type { DateRange as DayPickerDateRange } from 'react-day-picker';

import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { Alert } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/lib/services/logger';
import { ratesService } from '@/lib/services/rates';
import type { RateForecast, RateReport } from '@/types/rates';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

/**
 * Props for the RateDashboard component
 * @interface RateDashboardProps
 */
interface RateDashboardProps {
  /** Organization ID for rate analytics */
  orgId: string;
}


/**
 * Date range selection interface
 * @interface DateRange
 */
type DateRange = DayPickerDateRange;

/**
 * Chart data point structure
 * @interface ChartDataPoint
 */
interface ChartDataPoint {
  /** X-axis value (typically date) */
  x: string;
  /** Y-axis value (typically rate amount) */
  y: number;
}

/**
 * Chart dataset configuration
 * @interface ChartDataset
 */
interface ChartDataset {
  /** Dataset label */
  label: string;
  /** Array of data points */
  data: ChartDataPoint[];
  /** Line color for line charts */
  borderColor?: string;
  /** Fill color for bar charts */
  backgroundColor?: string;
  /** Line tension for smooth curves */
  tension?: number;
}

/**
 * Chart data structure
 * @interface ChartData
 */
interface ChartData {
  /** Array of datasets to display */
  datasets: ChartDataset[];
}

/**
 * Dashboard error type
 * @interface DashboardError
 * @extends {Error}
 */
interface DashboardError extends Error {
  /** Error code for specific error types */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * RateDashboard Component
 *
 * A dashboard component that displays rate analytics including forecasts and historical data.
 * Provides interactive charts and date range selection for data visualization.
 *
 * @component
 * @param {RateDashboardProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function RateDashboard({ orgId }: RateDashboardProps): JSX.Element {
  // State management
  const [forecasts, setForecasts] = useState<RateForecast[]>([]);
  const [reports, setReports] = useState<RateReport[]>([]);
  const [error, setError] = useState<DashboardError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  /**
   * Validates date range input
   * @param {DateRange} range - Date range to validate
   * @returns {boolean} True if range is valid
   */
  const isValidDateRange = useCallback((range: DateRange): boolean => {
    return Boolean(
      range.from && range.to && isValid(range.from) && isValid(range.to) && range.from <= range.to,
    );
  }, []);

  /**
   * Formats dates for API requests
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  const formatDate = useCallback((date: Date | undefined): string => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  }, []);

  /**
   * Loads dashboard data from the API
   */
  const loadData = useCallback(async () => {
    if (!isValidDateRange(dateRange)) {
      const message = 'Invalid date range selected';
      logger.warn(
        message,
        {
          from: dateRange.from,
          to: dateRange.to,
          orgId,
        },
        'RateDashboard',
      );
      setError({
        name: 'ValidationError',
        message: 'Please select a valid date range',
        code: 'INVALID_DATE_RANGE',
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.info(
        'Loading dashboard data',
        {
          orgId,
          dateRange: {
            from: formatDate(dateRange.from),
            to: formatDate(dateRange.to),
          },
        },
        'RateDashboard',
      );

      const [forecastsResponse, reportsResponse] = await Promise.all([
        ratesService.getForecastsByDateRange({
          org_id: orgId,
          start_date: formatDate(dateRange.from),
          end_date: formatDate(dateRange.to),
        }),
        ratesService.getReportsByDateRange({
          org_id: orgId,
          start_date: formatDate(dateRange.from),
          end_date: formatDate(dateRange.to),
        }),
      ]);

      setForecasts((forecastsResponse as { data: RateForecast[] }).data || []);
      setReports((reportsResponse as { data: RateReport[] }).data || []);
    } catch (err) {
      const error = err as DashboardError;
      logger.error(
        'Failed to load dashboard data',
        error,
        {
          orgId,
          dateRange: {
            from: formatDate(dateRange.from),
            to: formatDate(dateRange.to),
          },
        },
        'RateDashboard',
      );
      setError({
        name: 'LoadDataError',
        message: 'Failed to load dashboard data',
        code: error.code,
        details: error.details,
      });
    } finally {
      setLoading(false);
    }
  }, [orgId, dateRange, formatDate, isValidDateRange]);

  // Load data when component mounts or date range changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadData();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [loadData]);

  // Memoized chart data
  const forecastData: ChartData = useMemo(
    () => ({
      datasets: [
        {
          label: 'Rate Forecasts',
          data: forecasts.map((forecast) => ({
            x: formatDate(new Date(forecast.forecast_date)),
            y: forecast.forecast_value,
          })),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    }),
    [forecasts, formatDate],
  );

  const reportData: ChartData = useMemo(
    () => ({
      datasets: [
        {
          label: 'Actual Rates',
          data: reports
            .filter(
              (report): report is RateReport & { data: { actual_rate: number } } =>
                typeof report.data.actual_rate === 'number' && !isNaN(report.data.actual_rate),
            )
            .map((report) => ({
              x: formatDate(new Date(report.report_date)),
              y: report.data.actual_rate,
            })),
          backgroundColor: 'rgb(53, 162, 235)',
        },
      ],
    }),
    [reports, formatDate],
  );

  // Chart options
  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM d',
          },
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Rate ($)',
        },
      },
    },
  };

  /**
   * Handles date range changes
   * @param {DateRange} range - New date range
   */
  const handleDateRangeChange = useCallback(
    (range: DateRange) => {
      if (isValidDateRange(range)) {
        logger.info(
          'Date range changed',
          {
            from: formatDate(range.from),
            to: formatDate(range.to),
            orgId,
          },
          'RateDashboard',
        );
        setDateRange(range);
        setError(null);
      } else {
        logger.warn(
          'Invalid date range selected',
          {
            from: formatDate(range.from),
            to: formatDate(range.to),
            orgId,
          },
          'RateDashboard',
        );
        setError({
          name: 'ValidationError',
          message: 'Please select a valid date range',
          code: 'INVALID_DATE_RANGE',
        });
      }
    },
    [isValidDateRange, formatDate, orgId],
  );

  if (loading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-[400px]' />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>Rate Analytics</h2>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={handleDateRangeChange}
          />
        </div>

        {error && (
          <Alert variant='destructive'>
            <p className='text-sm font-medium'>{error.message}</p>
            {error.details && <p className='mt-1 text-xs'>{JSON.stringify(error.details)}</p>}
          </Alert>
        )}

        <div className='grid gap-6 md:grid-cols-2'>
          <Card className='p-4'>
            <h3 className='mb-4 text-lg font-semibold'>Rate Forecasts</h3>
            <Line
              data={forecastData}
              options={chartOptions}
            />
          </Card>

          <Card className='p-4'>
            <h3 className='mb-4 text-lg font-semibold'>Actual Rates</h3>
            <Bar
              data={reportData}
              options={chartOptions}
            />
          </Card>
        </div>

        {(!forecasts.length || !reports.length) && (
          <Alert>
            <p className='text-sm'>No data available for the selected date range</p>
          </Alert>
        )}
      </div>
    </ErrorBoundary>
  );
}
