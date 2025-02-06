import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Alert {
  id: string;
  type: keyof typeof alertStyles;
  message: string;
  date: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'High',
    message: 'Missing required documentation for client onboarding',
    date: '2024-02-06',
  },
  {
    id: '2',
    type: 'Medium',
    message: 'Incomplete risk assessment form',
    date: '2024-02-05',
  },
  {
    id: '3',
    type: 'Low',
    message: 'Pending annual review',
    date: '2024-02-04',
  },
];

const alertStyles = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Low: 'bg-blue-100 text-blue-700',
} as const;

export function ComplianceAlerts(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between space-x-4 rounded-lg border p-4"
            >
              <div
                className={`rounded-full px-2 py-1 text-xs ${alertStyles[alert.type]}`}
              >
                {alert.type}
              </div>
              <div className='flex-1 space-y-1'>
                <p className='text-sm font-medium'>{alert.message}</p>
                <p className='text-sm text-gray-500'>Due: {alert.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
