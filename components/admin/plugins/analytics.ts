import { type Plugin } from '@measured/puck';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { type Database } from '@/lib/types/database';
import { type ExtendedPuckData } from '@/lib/types/puck';
import * as React from 'react';
import dynamic from 'next/dynamic';

const AnalyticsToast = dynamic(() => import('./AnalyticsToast').then((mod) => mod.AnalyticsToast));

interface HeaderActionsProps {
  defaultActions: Array<{
    label: string;
    onClick: () => void | Promise<void>;
  }>;
  data: ExtendedPuckData & { id: string };
}

function HeaderActions({ defaultActions, data }: HeaderActionsProps) {
  const supabase = createClient();

  const trackAction = React.useCallback(
    async (action: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const analyticsData: Database['public']['Tables']['editor_analytics']['Insert'] = {
          action,
          page_id: data.id,
          user_email: user?.email || '',
          metadata: {
            componentCount: Object.values((data as ExtendedPuckData).zones || {}).flat().length,
            timestamp: new Date().toISOString(),
          },
        };

        await supabase.from('editor_analytics').insert(analyticsData);
      } catch (error) {
        console.error('Failed to track analytics:', error);
      }
    },
    [data, supabase]
  );

  // Track initial load
  React.useEffect(() => {
    trackAction('editor_opened');
    return () => {
      trackAction('editor_closed');
    };
  }, [trackAction]);

  return [
    ...defaultActions,
    {
      label: 'Analytics',
      onClick: async () => {
        try {
          const { data: stats, error } = await supabase
            .from('editor_analytics')
            .select('action, created_at')
            .eq('page_id', data.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;

          const AnalyticsToastComponent = React.createElement(AnalyticsToast, {
            stats: stats || [],
          });
          React.createElement(React.Fragment, null, AnalyticsToastComponent);
        } catch (error) {
          console.error('Failed to fetch analytics:', error);
          toast({
            title: 'Error',
            description: 'Failed to load analytics data',
            variant: 'destructive',
          });
        }
      },
    },
  ];
}

export const analyticsPlugin: Plugin = {
  name: 'analytics',
  register: ({ onRender }) => {
    onRender(({ data }) => {
      // Track page render
      console.warn('Page render:', data);
    });
  },
  overrides: {
    headerActions: HeaderActions,
  },
};
