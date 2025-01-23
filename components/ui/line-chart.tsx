import type { FC } from 'react'
import { useEffect, useRef, useMemo } from 'react'
import * as d3 from 'd3'
import styles from './line-chart.module.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

export interface DataPoint {
  date: Date
  value: number
  type?: string
  label: string
  timestamp?: number
}

export interface LineChartProps {
  data: ChartData<'line'> | DataPoint[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
  groupBy?: string
  options?: ChartOptions<'line'>
}

const defaultOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Performance Metrics',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}

const LineChart: FC<LineChartProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 60, bottom: 30, left: 40 },
  colors = ['#2563eb', '#16a34a', '#dc2626'],
  groupBy,
  options = {},
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<ChartJS | null>(null)

  const isDataPoints = (data: ChartData<'line'> | DataPoint[]): data is DataPoint[] => {
    return Array.isArray(data) && data.length > 0 && 'date' in data[0]
  }

  const chartData = useMemo(() => {
    if (!isDataPoints(data)) return data

    const groupedData = groupBy
      ? d3.group(data as DataPoint[], (d) => d[groupBy as keyof DataPoint])
      : new Map([[undefined, data as DataPoint[]]])

    return {
      labels: Array.from(new Set((data as DataPoint[]).map((d) => d.label))),
      datasets: Array.from(groupedData.entries()).map(([key, values], i) => ({
        label: key?.toString() ?? 'Default',
        data: values.map((v) => v.value),
        borderColor: colors[i % colors.length],
        tension: 0.4,
      })),
    }
  }, [data, groupBy, colors])

  const chartOptions = useMemo(
    () => ({
      ...defaultOptions,
      ...options,
      scales: {
        x: {
          type: 'time' as const,
          grid: { display: false },
          time: {
            unit: 'hour' as const,
            displayFormats: {
              hour: 'HH:mm',
            },
          },
        },
        y: {
          type: 'linear' as const,
          beginAtZero: true,
          grid: { display: true },
        },
      },
    }),
    [options]
  )

  useEffect(() => {
    if (!svgRef.current || !isDataPoints(data)) return

    const svg = d3.select(svgRef.current)
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.selectAll('*').remove()

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, chartWidth])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .range([chartHeight, 0])

    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Add axes
    g.append('g').attr('transform', `translate(0,${chartHeight})`).call(d3.axisBottom(xScale))

    g.append('g').call(d3.axisLeft(yScale))

    // Add line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colors[0])
      .attr('stroke-width', 1.5)
      .attr('d', line)
  }, [data, width, height, margin, colors])

  useEffect(() => {
    if (!canvasRef.current || isDataPoints(data)) return

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart instance
    chartInstance.current = new ChartJS(canvasRef.current, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [chartData, chartOptions, data, isDataPoints])

  return (
    <div
      className={styles.chartWrapper}
      style={
        { '--chart-width': `${width}px`, '--chart-height': `${height}px` } as React.CSSProperties
      }
    >
      <div className={styles.chartContainer}>
        {isDataPoints(data) ? (
          <svg ref={svgRef} width={width} height={height} className={styles.chart} />
        ) : (
          <canvas ref={canvasRef} className={styles.chart} width={width} height={height} />
        )}
      </div>
    </div>
  )
}

export default LineChart
