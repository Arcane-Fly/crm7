import * as React from 'react';

interface RecentActivityProps {
  stats: Array<{
    action: string;
    created_at: string;
  }>;
}

export function RecentActivity({ stats }: RecentActivityProps) {
  return (
    <div className="mt-2 space-y-1">
      {stats?.map((stat, i) => (
        <div key={i} className="text-sm">
          {stat.action} - {new Date(stat.created_at).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
