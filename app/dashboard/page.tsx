import { Card, CardContent } from "@/components/ui/card"
import { Users, Briefcase, Building2, AlertCircle } from "lucide-react"
import { PlacementsChart } from "@/components/dashboard/PlacementsChart"
import { FundingChart } from "@/components/dashboard/FundingChart"
import { AlertsList } from "@/components/dashboard/AlertsList"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Candidates</p>
                <p className="text-2xl font-bold">2,451</p>
                <p className="text-sm font-medium text-green-600">+12% vs last month</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Placements</p>
                <p className="text-2xl font-bold">847</p>
                <p className="text-sm font-medium text-green-600">+5% vs last month</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Clients</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm font-medium text-green-600">+3% vs last month</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Compliance Alerts</p>
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm font-medium text-red-600">-15% vs last month</p>
              </div>
              <div className="rounded-full bg-red-50 p-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PlacementsChart />
          <div className="mt-6">
            <FundingChart />
          </div>
        </div>
        <div>
          <AlertsList />
        </div>
      </div>
    </div>
  )
}