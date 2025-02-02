'use client';

import { cn } from '@/lib/utils';

interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DashboardTabs({ tabs, activeTab, onTabChange }: TabProps): void {
  return (
    <div className='border-b border-gray-200'>
      <nav className='-mb-px flex space-x-8'>
        {tabs.map((tab: unknown) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab: unknown)}
            className={cn(
              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  );
}
