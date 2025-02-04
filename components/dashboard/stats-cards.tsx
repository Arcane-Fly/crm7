'use client';

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { ReactElement } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: ReactElement;
}

const StatsCard = ({ title, value, change, icon }: StatsCardProps): ReactElement => {
  const isPositive = change > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="flex items-center text-xs text-muted-foreground">
          <span
            className={cn(
              'mr-1',
              isPositive ? 'text-emerald-500' : 'text-destructive',
            )}
          >
            {isPositive ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            {Math.abs(change)}%
          </span>
          vs last month
        </p>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  totalCandidates: number;
  activeRecruitments: number;
  activePlacements: number;
  complianceAlerts: number;
}

export function DashboardStats({
  totalCandidates,
  activeRecruitments,
  activePlacements,
  complianceAlerts,
}: DashboardStatsProps): ReactElement {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Candidates"
        value={totalCandidates.toLocaleString()}
        change={12}
        icon={<UsersIcon className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Active Recruitments"
        value={activeRecruitments}
        change={8}
        icon={<BriefcaseIcon className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Active Placements"
        value={activePlacements}
        change={24}
        icon={<LayersIcon className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Compliance Alerts"
        value={complianceAlerts}
        change={-15}
        icon={<AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
