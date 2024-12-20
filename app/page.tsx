'use client';

import { useState } from 'react';
import { Users, Building2, AlertTriangle, DollarSign } from 'lucide-react';
import { StatsCard } from '../components/ui/StatsCard';
import { DashboardTabs } from '../components/ui/DashboardTabs';
import { ProgressChart } from '../components/ui/ProgressChart';
import { NotificationList } from '../components/ui/NotificationList';

const tabs = ['Overview', 'Analytics', 'Reports', 'Notifications'];

export default function Home() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your Labour Hire CRM
          </p>
        </div>

        <DashboardTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Apprentices"
            value="1,234"
            change="+14 from last month"
            icon={<Users className="h-5 w-5" />}
          />
          <StatsCard
            title="Active Placements"
            value="867"
            change="+23 from last month"
            icon={<Building2 className="h-5 w-5" />}
          />
          <StatsCard
            title="Funding Claimed"
            value="$1.2M"
            change="$55k from last month"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatsCard
            title="Compliance Alerts"
            value="23"
            change="+3 from last month"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">Progress by Year</h3>
            <ProgressChart />
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">Recent Notifications</h3>
            <NotificationList />
          </div>
        </div>
      </div>
    </main>
  );
}