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
  Legend,
  Filler,
  type Scale,
  type CoreScaleOptions,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Funding Overview',
    },
  },
  scales: {
    y: {
      type: 'linear' as const,
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        callback: function (this: Scale<CoreScaleOptions>, value: string | number) {
          return `$${Number(value).toLocaleString()}`
        },
      },
    },
    x: {
      type: 'category' as const,
      grid: {
        display: false,
      },
    },
  },
}

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']

export const data = {
  labels,
  datasets: [
    {
      fill: true,
      label: 'Funding Received',
      data: [65, 59, 80, 81, 56, 55, 40],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
}

export function FundingChart() {
  return (
    <div className='rounded-lg bg-white p-4 shadow-sm'>
      <div className='h-[400px] w-full'>
        <Line options={options} data={data} />
      </div>
    </div>
  )
}
