import React from 'react'
import type { ChartData, ChartOptions } from 'chart.js'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export interface ChartProps {
  data: ChartData<any>
  options?: ChartOptions<any>
  height?: number
  width?: number
  className?: string
  containerClassName?: string
}

const defaultOptions: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'center' as const,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        drawBorder: false,
      },
    },
  },
}

function ChartContainer({
  children,
  className,
  containerClassName,
  height = 300,
}: {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  height?: number
}) {
  return (
    <div className={containerClassName}>
      <div 
        className={className}
        style={{ height: height }}
      >
        {children}
      </div>
    </div>
  )
}

export function BarChart({ data, options, height, className, containerClassName }: ChartProps) {
  return (
    <ChartContainer height={height} className={className} containerClassName={containerClassName}>
      <Bar data={data} options={{ ...defaultOptions, ...options }} />
    </ChartContainer>
  )
}

export function LineChart({ data, options, height, className, containerClassName }: ChartProps) {
  return (
    <ChartContainer height={height} className={className} containerClassName={containerClassName}>
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </ChartContainer>
  )
}

export function PieChart({ data, options, height, className, containerClassName }: ChartProps) {
  const pieOptions = {
    ...defaultOptions,
    aspectRatio: 1,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins?.legend,
        position: 'right' as const,
      },
    },
  }

  return (
    <ChartContainer height={height} className={className} containerClassName={containerClassName}>
      <Pie data={data} options={{ ...pieOptions, ...options }} />
    </ChartContainer>
  )
}

// Export chart colors for consistent styling
export const chartColors = {
  primary: 'rgb(99, 102, 241)',
  secondary: 'rgb(161, 163, 247)',
  success: 'rgb(34, 197, 94)',
  warning: 'rgb(234, 179, 8)',
  error: 'rgb(239, 68, 68)',
  gray: 'rgb(156, 163, 175)',
} as const

// Export chart gradients for consistent styling
export function getChartGradient(ctx: CanvasRenderingContext2D, color: string) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  return gradient
}

// Export helper for responsive font sizes
export function getResponsiveFontSize(width: number): number {
  if (width < 400) return 10
  if (width < 600) return 12
  return 14
}
