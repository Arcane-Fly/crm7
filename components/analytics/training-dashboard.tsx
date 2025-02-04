import { useState, useEffect } from 'react';
import { type TrainingStats } from '@/lib/types';

export function TrainingDashboard(): JSX.Element {
  const [stats, setStats] = useState<TrainingStats>({
    completionRate: 0,
    averageScore: 0,
    totalEnrollments: 0
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Completion Rate</h3>
          <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
