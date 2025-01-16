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
}

export function BarChart({ data, options, height, width }: ChartProps) {
  return <Bar data={data} options={options} height={height} width={width} />
}

export function LineChart({ data, options, height, width }: ChartProps) {
  return <Line data={data} options={options} height={height} width={width} />
}

export function PieChart({ data, options, height, width }: ChartProps) {
  return <Pie data={data} options={options} height={height} width={width} />
}
