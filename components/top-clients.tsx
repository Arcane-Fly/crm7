import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const clients = [
  {
    name: 'ABC Construction',
    apprentices: 15,
    satisfaction: 98,
    status: 'Active',
  },
  {
    name: 'XYZ Industries',
    apprentices: 12,
    satisfaction: 95,
    status: 'Active',
  },
  {
    name: 'Metro Engineering',
    apprentices: 10,
    satisfaction: 92,
    status: 'Active',
  },
  {
    name: 'City Builders',
    apprentices: 8,
    satisfaction: 90,
    status: 'Active',
  },
  {
    name: 'Tech Solutions',
    apprentices: 7,
    satisfaction: 88,
    status: 'Active',
  },
]

export function TopClients() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {clients.map((client, index) => (
            <div key={index} className='flex items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>{client.name}</p>
                <p className='text-sm text-gray-500'>{client.apprentices} apprentices</p>
              </div>
              <div className='flex items-center gap-2'>
                <div className='text-sm font-medium text-green-600'>{client.satisfaction}%</div>
                <div className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-700'>
                  {client.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
