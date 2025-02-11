import * as React from 'react';
import { toast } from '@/components/ui/use-toast';

interface AnalyticsToastProps {
  stats: Array<{
    action: string;
    created_at: string;
  }>;
}

export function AnalyticsToast({ stats }: AnalyticsToastProps) {
  React.useEffect(() => {
    toast({
      title: 'Recent Activity',
      description: (
        <div className="mt-2 space-y-1">
          {stats?.map((stat, i) => (
            <div key={i} className="text-sm">
              {stat.action} - {new Date(stat.created_at).toLocaleString()}
            </div>
          ))}
        </div>
      ),
    });
  }, [stats]);

  return null;
}
