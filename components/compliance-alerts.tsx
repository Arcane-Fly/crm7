import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const alerts = [
  {
    type: 'High',
    description: '5 apprentices due for quarterly review',
    dueDate: 'Next Week',
  },
  {
    type: 'Medium',
    description: 'Safety certifications expiring for 3 host employers',
    dueDate: '2 Weeks',
  },
  {
    type: 'Low',
    description: 'Training plan updates required for electrical trade',
    dueDate: '3 Weeks',
  },
  {
    type: 'Medium',
    description: 'Workplace assessment due for Metro Engineering',
    dueDate: '1 Month',
  },
]

const alertStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
}

export function ComplianceAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {alerts.map((alert, index) => (
            <div key={index} className='flex items-start gap-4'>
              <div
                className={`rounded-full px-2 py-1 text-xs ${alertStyles[alert.type as keyof typeof alertStyles]}`}
              >
                {alert.type}
              </div>
              <div className='flex-1 space-y-1'>
                <p className='text-sm font-medium'>{alert.description}</p>
                <p className='text-sm text-gray-500'>Due: {alert.dueDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
