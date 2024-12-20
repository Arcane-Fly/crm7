import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopClients() {
  return (
    <div className="space-y-8">
      {topClients.map((client) => (
        <div key={client.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={client.logo} alt={client.name} />
            <AvatarFallback>{client.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{client.name}</p>
            <p className="text-sm text-muted-foreground">
              {client.industry}
            </p>
          </div>
          <div className="ml-auto font-medium">{client.placements} placements</div>
        </div>
      ))}
    </div>
  )
}

const topClients = [
  {
    id: "1",
    name: "TechCorp",
    industry: "Technology",
    placements: 15,
    logo: "/logos/techcorp.png",
  },
  {
    id: "2",
    name: "BuildCo",
    industry: "Construction",
    placements: 12,
    logo: "/logos/buildco.png",
  },
  {
    id: "3",
    name: "DataInsights",
    industry: "Data Analytics",
    placements: 10,
    logo: "/logos/datainsights.png",
  },
  {
    id: "4",
    name: "DesignHub",
    industry: "Design",
    placements: 8,
    logo: "/logos/designhub.png",
  },
  {
    id: "5",
    name: "GrowthMax",
    industry: "Marketing",
    placements: 7,
    logo: "/logos/growthmax.png",
  },
]

