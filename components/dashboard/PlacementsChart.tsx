'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale: unknown, LinearScale, BarElement, Title, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: '#f3f4f6',
      },
    },
    y: {
      grid: {
        display: true,
        color: '#f3f4f6',
      },
      beginAtZero: true,
    },
  },
};

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [12, 14, 17, 13, 20, 24],
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    },
  ],
};

export function PlacementsChart(): void {
  return (
    <div className='rounded-lg border bg-white p-6'>
      <Bar
        options={options}
        data={data}
        height={300}
      />
    </div>
  );
}
