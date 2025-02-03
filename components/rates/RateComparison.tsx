import { useState, useEffect } from 'react';
import { type RateTemplate } from '@/lib/types/rates';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/lib/supabase/supabase-provider';

interface RateComparisonProps {
  orgId: string;
}

export function RateComparison({ orgId }: RateComparisonProps): React.ReactElement {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<RateTemplate[]>([]);

  useEffect(() => {
    const fetchTemplates = async (): Promise<void> => {
      try {
        const { data, error } = await supabase
          .from('rate_templates')
          .select('*')
          .eq('org_id', orgId)
          .eq('status', 'active');

        if (error) throw error;
        setTemplates(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, [orgId, supabase, toast]);

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!templates.length) return <div>No templates available for comparison</div>;

  return (
    <div className="space-y-6">
      {/* Component implementation */}
    </div>
  );
}
