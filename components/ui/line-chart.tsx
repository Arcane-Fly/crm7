// Types and dependencies
import type { ChartData, ChartOptions } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

// Local imports
import { cn } from '@/lib/utils';

// Styles
import '../styles/line-chart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  className?: string;
}

export function LineChart({ data, options, className }: LineChartProps): React.ReactElement {
  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className={cn('line-chart-container', className)}>
      <Line
        data={data}
        options={options || defaultOptions}
      />
    </div>
  );
}
