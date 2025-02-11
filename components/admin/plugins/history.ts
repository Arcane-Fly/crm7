import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { type Plugin } from '@measured/puck';
import { type Tables } from '@/lib/types/database';
import { type ExtendedPuckData, type PageVersion } from '@/lib/types/puck';

export const historyPlugin: Plugin = {
  overrides: {
    headerActions: ({ defaultActions, data, children }) => {
      const supabase = createClient();

      return [
        ...defaultActions,
        {
          label: 'Save Version',
          onClick: async () => {
            try {
              const {
                data: { user },
                error: userError,
              } = await supabase.auth.getUser();

              if (userError) throw userError;

              const versionData: Tables<'page_versions'>['Insert'] = {
                page_id: data.id,
                content: data as ExtendedPuckData,
                created_by: user?.email || '',
              };

              const { error } = await supabase
                .from('page_versions')
                .insert(versionData)
                .returns<PageVersion>();

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
        },
        children,
      ];
    },
  },
};
