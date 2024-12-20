import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon } from 'lucide-react'

export function UpcomingInterviews() {
  return (
    <div className="space-y-8">
      {upcomingInterviews.map((interview) => (
        <div key={interview.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={interview.avatar} alt="Avatar" />
            <AvatarFallback>{interview.candidate.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{interview.candidate}</p>
            <p className="text-sm text-muted-foreground">
              {interview.position}
            </p>
          </div>
          <div className="ml-auto flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{interview.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const upcomingInterviews = [
  {
    id: "1",
    candidate: "Emma Thompson",
    position: "Frontend Developer",
    date: "2023-07-15",
    avatar: "/avatars/06.png",
  },
  {
    id: "2",
    candidate: "Michael Chen",
    position: "Data Scientist",
    date: "2023-07-16",
    avatar: "/avatars/07.png",
  },
  {
    id: "3",
    candidate: "Sarah Johnson",
    position: "Product Manager",
    date: "2023-07-17",
    avatar: "/avatars/08.png",
  },
  {
    id: "4",
    candidate: "David Rodriguez",
    position: "DevOps Engineer",
    date: "2023-07-18",
    avatar: "/avatars/09.png",
  },
  {
    id: "5",
    candidate: "Lisa Patel",
    position: "UI/UX Designer",
    date: "2023-07-19",
    avatar: "/avatars/10.png",
  },
]

