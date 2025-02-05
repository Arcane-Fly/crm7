import type { DashboardAlert } from '@/types/dashboard';
import PlacementTrends from '@/components/dashboard/placement-trends';
import { AlertsSection } from '@/components/dashboard/alerts-section';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { DashboardStats } from '@/components/dashboard/stats-cards';

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

export default function DashboardPage(): JSX.Element {
  return (
    <div className="space-y-6 p-6">
      <DashboardStats
        totalCandidates={2451}
        activeRecruitments={156}
        activePlacements={847}
        complianceAlerts={15}
      />
      <div className="grid gap-6 md:grid-cols-7">
        <div className="col-span-5">
          <PlacementTrends data={mockMonthlyData.map(item => ({ date: item.month, count: item.placements }))} />
        </div>
        <div className="col-span-2 space-y-6">
          <QuickActions />
          <AlertsSection alerts={mockAlerts} />
        </div>
      </div>
    </div>
  );
}
