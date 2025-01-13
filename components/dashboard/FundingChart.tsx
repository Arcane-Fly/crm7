'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: '#f3f4f6'
      }
    },
    y: {
      grid: {
        display: true,
        color: '#f3f4f6'
      },
      beginAtZero: true,
      ticks: {
        callback: (value: number) => `$${value.toLocaleString()}`
      }
    }
  }
}

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [45000, 50000, 48000, 49000, 58000, 62000],
      borderColor: '#3b82f6',
      backgroundColor: '#3b82f6',
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2
    }
  ]
}

export function FundingChart() {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Funding Overview</h3>
        <button className="flex items-center gap-2 rounded-md border px-3 py-1 text-sm hover:bg-gray-50">
          Export
        </button>
      </div>
      <Line options={options} data={data} height={300} />
    </div>
  )
}
