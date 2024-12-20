import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentPlacements } from "@/components/dashboard/recent-placements"
import { TopClients } from "@/components/dashboard/top-clients"
import { UpcomingInterviews } from "@/components/dashboard/upcoming-interviews"
import { ApprenticeProgress } from "@/components/dashboard/apprentice-progress"
import { ComplianceAlerts } from "@/components/dashboard/compliance-alerts"
import { FundingOverview } from "@/components/dashboard/funding-overview"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Briefcase, GraduationCap, AlertTriangle, DollarSign } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"

export default function DashboardPage() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Dashboard</BreadcrumbItem>
      </Breadcrumb>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Apprentices
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +56 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Placements
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">867</div>
                  <p className="text-xs text-muted-foreground">
                    +23 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Funding Claimed
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1.2M</div>
                  <p className="text-xs text-muted-foreground">
                    +$305K from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Compliance Alerts
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">
                    -5 from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Apprentice Progress Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ApprenticeProgress />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Funding Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <FundingOverview />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Top Host Employers</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopClients />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Compliance Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComplianceAlerts />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

