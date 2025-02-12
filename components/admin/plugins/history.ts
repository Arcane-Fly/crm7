import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { type Plugin } from '@measured/puck';
import { type ExtendedPuckData } from '@/lib/types/puck';
import * as React from 'react';

function HeaderActions({ children }: { children: React.ReactNode }): React.ReactElement {
  const supabase = createClient();

  return React.createElement('div', {}, [
    children,
    React.createElement('button', {
      key: 'save-version',
      onClick: async () => {
        try {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) throw userError;

          const versionData = {
            content: {},
            created_by: user?.email || '',
          };

          const { error } = await supabase
            .from('page_versions')
            .insert(versionData);

          if (error) throw error;

          toast({
            title: 'Version saved',
            description: 'A new version of this page has been saved.',
          });
        } catch (error) {
          console.error('Failed to save version:', error);
          toast({
            title: 'Error',
            description: 'Failed to save version. Please try again.',
            variant: 'destructive',
          });
        }
      },
      children: 'Save Version'
    })
  ]);
}

export const historyPlugin: Plugin = {
  overrides: {
    headerActions: HeaderActions,
  },
};
