import { Overview } from "@/components/overview"
import { RecentActivity } from "@/components/recent-activity"
import { TopClients } from "@/components/top-clients"
import { UpcomingInterviews } from "@/components/upcoming-interviews"
import { RecentPlacements } from "@/components/recent-placements"
import { ComplianceAlerts } from "@/components/compliance-alerts"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Overview />
        <ComplianceAlerts />
        <TopClients />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RecentActivity />
        <UpcomingInterviews />
        <RecentPlacements />
      </div>
    </div>
  )
}