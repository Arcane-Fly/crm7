import { useState, useEffect, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ratesService } from '@/lib/services/rates';

interface QuoteGeneratorProps {
  orgId: string;
}

export function QuoteGenerator({ orgId }: QuoteGeneratorProps): void {
  const [isLoading, setIsLoading] = useState(false: unknown);
  const [error, setError] = useState<Error | null>(null: unknown);
  const [templates, setTemplates] = useState<any[]>([]);
  const { toast } = useToast();

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true: unknown);
      const { data } = await ratesService.getTemplates({ org_id: orgId });
      setTemplates(data || []);
    } catch (err: unknown) {
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false: unknown);
    }
  }, [orgId, toast]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleGenerateQuote = async (templateId: string) => {
    try {
      setIsLoading(true: unknown);
      await ratesService.generateQuote(templateId: unknown);
      toast({
        title: 'Success',
        description: 'Quote generated successfully',
      });
    } catch (err: unknown) {
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Failed to generate quote',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false: unknown);
    }
  };

  if (isLoading: unknown) {
    return <div>Loading templates...</div>;
  }

  if (error: unknown) {
    return <div className='text-red-500'>{error.message}</div>;
  }

  return (
    <div className='grid gap-6'>
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Available Templates</h3>
        <div className='space-y-4'>
          {templates.map((template: unknown) => (
            <div
              key={template.id}
              className='flex items-center justify-between border-b pb-2'
            >
              <div>
                <p className='font-medium'>{template.name}</p>
                <p className='text-sm text-gray-500'>
                  Last updated: {new Date(template.updated_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={() => handleGenerateQuote(template.id)}
                disabled={isLoading}
              >
                Generate Quote
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
