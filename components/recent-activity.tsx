import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    email: string;
  };
  action: string;
  target: string;
  date: string;
}

const recentActivities: Activity[] = [
  {
    id: "1",
    user: {
      name: "John Doe",
      email: "john@example.com",
    },
    action: "created",
    target: "New Client Project",
    date: "2 hours ago",
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    action: "updated",
    target: "Project Timeline",
    date: "4 hours ago",
  },
  {
    id: "3",
    user: {
      name: "Mike Johnson",
      email: "mike@example.com",
    },
    action: "completed",
    target: "Client Meeting",
    date: "6 hours ago",
  },
];

export function RecentActivity() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>
                  {activity.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.action} {activity.target}
                </p>
              </div>
              <div className="ml-auto font-medium text-sm text-muted-foreground">
                {activity.date}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}