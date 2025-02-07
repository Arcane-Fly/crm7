import type { DashboardAlert } from '@/types/dashboard';
import PlacementTrends from '@/components/dashboard/placement-trends';
import { AlertsSection } from '@/components/dashboard/alerts-section';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DashboardStats } from '@/components/dashboard/stats-cards';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const mockMonthlyData = [
  { month: 'Jan', placements: 65 },
  { month: 'Feb', placements: 59 },
  { month: 'Mar', placements: 80 },
  { month: 'Apr', placements: 81 },
  { month: 'May', placements: 56 },
  { month: 'Jun', placements: 55 },
];

const mockAlerts: DashboardAlert[] = [
  {
    id: '1',
    title: 'Compliance Documents Expiring',
    description: '15 candidates have documents expiring in the next 30 days',
    severity: 'high',
    type: 'warning',
  },
  {
    id: '2',
    title: 'New Training Requirements',
    description: 'Updated workplace safety training requirements for all candidates',
    severity: 'medium',
    type: 'info',
  },
];

export default async function DashboardPage(): Promise<JSX.Element> {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <QuickActions />
        </div>
      </div>
      <Suspense fallback={<StatsCardsSkeleton />}>
        <DashboardStats
          totalCandidates={2451}
          activeRecruitments={156}
          activePlacements={847}
          complianceAlerts={15}
        />
      </Suspense>
      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-8">
        <Card className="col-span-5 lg:col-span-6">
          <div className="flex h-full flex-col space-y-4">
            <div className="flex items-center justify-between px-6 pt-6">
              <h3 className="text-lg font-medium">Placement Trends</h3>
              <div className="flex items-center space-x-2">
                {/* Add period selector here if needed */}
              </div>
            </div>
            <Suspense fallback={<div className="h-[350px] animate-pulse bg-muted" />}>
              <PlacementTrends 
                data={mockMonthlyData.map(item => ({ 
                  date: item.month, 
                  count: item.placements 
                }))} 
              />
            </Suspense>
          </div>
        </Card>
        <div className="col-span-2 space-y-6">
          <Suspense fallback={<AlertsSkeleton />}>
            <AlertsSection alerts={mockAlerts} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-7 w-[100px]" />
          <Skeleton className="mt-4 h-4 w-[60px]" />
        </Card>
      ))}
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-7 w-[140px]" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[60px] w-full" />
        ))}
      </div>
    </Card>
  );
}
