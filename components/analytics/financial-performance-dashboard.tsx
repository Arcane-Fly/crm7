import { useState, useEffect } from 'react';
import { type Performance, type PerformanceStats } from '@/lib/types';

export function FinancialPerformanceDashboard(): React.ReactElement {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [stats, setStats] = useState<PerformanceStats>({
    averageRating: 0,
    completionRate: 0
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('financial_performances').select('*');
        
        if (error) throw error;
        
        if (data) {
          setPerformances(data);
          calculateStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      }
    };

    void fetchData();
  }, []); // Empty dependency array since supabase is stable

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'submitted':
        return 'text-blue-500';
      case 'draft':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Average Rating</h3>
          <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Completion Rate</h3>
          <p className="mt-1 text-sm text-gray-500">{stats.completionRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium mb-4">Recent Performances</h3>
        <div className="space-y-4">
          {performances.slice(0, 5).map((performance) => (
            <div
              key={performance.id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{performance.title}</p>
                <p className="text-sm text-gray-500">{performance.description}</p>
              </div>
              <span className={getStatusColor(performance.status)}>
                {performance.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
