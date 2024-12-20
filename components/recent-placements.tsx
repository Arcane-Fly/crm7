import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentPlacements() {
  return (
    <div className="space-y-8">
      {recentPlacements.map((placement) => (
        <div key={placement.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={placement.avatar} alt="Avatar" />
            <AvatarFallback>{placement.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{placement.name}</p>
            <p className="text-sm text-muted-foreground">
              {placement.position}
            </p>
          </div>
          <div className="ml-auto font-medium">{placement.company}</div>
        </div>
      ))}
    </div>
  )
}

const recentPlacements = [
  {
    id: "1",
    name: "Olivia Martin",
    position: "Software Engineer",
    company: "TechCorp",
    avatar: "/avatars/01.png",
  },
  {
    id: "2",
    name: "Jackson Lee",
    position: "Project Manager",
    company: "BuildCo",
    avatar: "/avatars/02.png",
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    position: "Data Analyst",
    company: "DataInsights",
    avatar: "/avatars/03.png",
  },
  {
    id: "4",
    name: "William Kim",
    position: "UX Designer",
    company: "DesignHub",
    avatar: "/avatars/04.png",
  },
  {
    id: "5",
    name: "Sofia Davis",
    position: "Marketing Specialist",
    company: "GrowthMax",
    avatar: "/avatars/05.png",
  },
]

