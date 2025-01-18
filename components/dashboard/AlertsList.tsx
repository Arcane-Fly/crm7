'use client'

import { Bell } from 'lucide-react'

const alerts = [
  {
    title: 'License Renewals Due',
    description: '8 apprentices have licenses expiring this month',
    priority: 'HIGH',
    type: 'error',
  },
  {
    title: 'Available Funding',
    description: 'New government incentives available for electrical apprentices',
    priority: 'MEDIUM',
    type: 'info',
  },
]

export function AlertsList() {
  return (
    <div className='rounded-lg border bg-white'>
      <div className='border-b p-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium'>Alerts</h3>
          <Bell className='h-4 w-4 text-gray-400' />
        </div>
      </div>
      <div className='divide-y'>
        {alerts.map((alert, index) => (
          <div key={index} className={`p-4 ${alert.type === 'error' ? 'bg-red-50' : 'bg-blue-50'}`}>
            <div className='mb-1 flex items-center justify-between'>
              <h4 className='font-medium'>{alert.title}</h4>
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  alert.priority === 'HIGH'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {alert.priority}
              </span>
            </div>
            <p className='text-sm text-gray-600'>{alert.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
