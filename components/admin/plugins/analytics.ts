import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { type Database } from '@/lib/types/database';
import { type ExtendedPuckData } from '@/lib/types/puck';
import { type Plugin } from '@measured/puck';
import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import * as React from 'react';

const AnalyticsToast = dynamic(() => import('./AnalyticsToast').then((mod) => mod.AnalyticsToast));

function HeaderActions({ children }: { children: React.ReactNode }): ReactElement {
  const supabase = createClient();

  return React.createElement('div', {}, [
    children,
    React.createElement('button', {
      key: 'analytics',
      onClick: async () => {
        try {
          const { data: stats, error } = await supabase
            .from('editor_analytics')
            .select('action, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;

          toast({
            title: 'Analytics',
            description: React.createElement(AnalyticsToast, { stats: stats || [] })
          });
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
          toast({
            title: 'Error',
            description: 'Failed to load analytics data',
            variant: 'destructive',
          });
        }
      },
      children: 'Analytics'
    })
  ]);
}

export const analyticsPlugin: Plugin = {
  overrides: {
    headerActions: HeaderActions,
  },
};
