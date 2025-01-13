import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const placements = [
  {
    apprentice: "John Smith",
    trade: "Electrical",
    employer: "ABC Construction",
    startDate: "Started Today",
    status: "New"
  },
  {
    apprentice: "Lisa Chen",
    trade: "Carpentry",
    employer: "City Builders",
    startDate: "Started Yesterday",
    status: "New"
  },
  {
    apprentice: "David Wilson",
    trade: "Plumbing",
    employer: "Metro Engineering",
    startDate: "Started 3 days ago",
    status: "In Progress"
  },
  {
    apprentice: "Emily Brown",
    trade: "HVAC",
    employer: "Tech Solutions",
    startDate: "Started 1 week ago",
    status: "In Progress"
  }
]

const statusStyles = {
  New: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700"
}

export function RecentPlacements() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Placements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {placements.map((placement, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{placement.apprentice}</div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  statusStyles[placement.status as keyof typeof statusStyles]
                }`}>
                  {placement.status}
                </div>
              </div>
              <div className="grid grid-cols-2 text-sm text-gray-500">
                <div>{placement.trade}</div>
                <div className="text-right">{placement.employer}</div>
              </div>
              <div className="text-xs text-gray-500">{placement.startDate}</div>
              {index < placements.length - 1 && (
                <hr className="my-2 border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
