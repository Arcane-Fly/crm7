import { AlertTriangle, Clock, FileWarning } from 'lucide-react'

export function ComplianceAlerts() {
  return (
    <div className="space-y-8">
      {complianceAlerts.map((alert) => (
        <div key={alert.id} className="flex items-center">
          {alert.type === 'expiry' && <Clock className="h-8 w-8 text-yellow-500" />}
          {alert.type === 'missing' && <FileWarning className="h-8 w-8 text-red-500" />}
          {alert.type === 'overdue' && <AlertTriangle className="h-8 w-8 text-orange-500" />}
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{alert.title}</p>
            <p className="text-sm text-muted-foreground">
              {alert.description}
            </p>
          </div>
          <div className="ml-auto font-medium">{alert.daysUntilDue}</div>
        </div>
      ))}
    </div>
  )
}

const complianceAlerts = [
  {
    id: "1",
    type: "expiry",
    title: "White Card Expiring",
    description: "John Doe's White Card is expiring soon",
    daysUntilDue: "15 days",
  },
  {
    id: "2",
    type: "missing",
    title: "Missing Police Check",
    description: "Sarah Smith's Police Check is missing",
    daysUntilDue: "Overdue",
  },
  {
    id: "3",
    type: "overdue",
    title: "Overdue Unit Completion",
    description: "Michael Johnson has an overdue unit",
    daysUntilDue: "5 days overdue",
  },
  {
    id: "4",
    type: "expiry",
    title: "First Aid Certificate Expiring",
    description: "Emma Brown's First Aid Certificate is expiring",
    daysUntilDue: "30 days",
  },
  {
    id: "5",
    type: "missing",
    title: "Incomplete Training Plan",
    description: "David Wilson's Training Plan is incomplete",
    daysUntilDue: "Action required",
  },
]

