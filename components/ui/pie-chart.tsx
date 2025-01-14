'use client'

import React from 'react'
import type { ChartData, ChartOptions } from 'chart.js'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface PieChartProps {
  data: ChartData<'pie'>
  options?: ChartOptions<'pie'>
}

export function PieChart({ data, options }: PieChartProps) {
  const defaultOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribution',
      },
    },
  }

  return (
    <div className='h-full min-h-[300px] w-full p-4'>
      <Pie data={data} options={options || defaultOptions} />
    </div>
  )
}
