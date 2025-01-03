import { Metadata } from "next";
import { OverviewCard } from "@/components/overview-card";
import { RecentActivity } from "@/components/recent-activity";
import { ActivityChart } from "@/components/activity-chart";
import { Users, Briefcase, FileText, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard - CRM7",
  description: "Main dashboard for CRM7",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Clients"
          value="2,850"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: 12,
            label: "from last month",
            positive: true,
          }}
        />
        <OverviewCard
          title="Active Projects"
          value="45"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: 8,
            label: "from last month",
            positive: true,
          }}
        />
        <OverviewCard
          title="Pending Tasks"
          value="24"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description="Tasks requiring attention"
        />
        <OverviewCard
          title="Revenue"
          value="$54,250"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{
            value: 4,
            label: "from last month",
            positive: false,
          }}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ActivityChart />
        <RecentActivity />
      </div>
    </div>
  );
}