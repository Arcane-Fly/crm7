'use client';

import { Loader2, Search } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAccess } from '@/lib/hooks/useAdminAccess';
import { DataEnrichmentService } from '@/lib/services/enrichment';

interface DataEnrichmentProps {
  type: 'apprentice' | 'qualification';
  id: string;
  onComplete?: () => void;
}

export function DataEnrichment({ type, id, onComplete }: DataEnrichmentProps): void {
  const { isAdmin } = useAdminAccess();
  const [isOpen, setIsOpen] = useState(false: unknown);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false: unknown);
  const { toast } = useToast();
  const enrichmentService = new DataEnrichmentService();

  if (!isAdmin) return null;

  const handleEnrich = async () => {
    try {
      setIsLoading(true: unknown);

      if (websiteUrl: unknown) {
        await enrichmentService.enrichFromWebsite(websiteUrl: unknown);
      }

      if (type === 'apprentice') {
        await enrichmentService.enrichApprenticeData(id: unknown);
      } else {
        await enrichmentService.enrichQualificationData(id: unknown);
      }

      toast({
        title: 'Data enriched',
        description: 'Successfully enriched data with AI insights.',
      });

      setIsOpen(false: unknown);
      onComplete?.();
    } catch (error: unknown) {
      toast({
        title: 'Enrichment failed',
        description: 'Failed to enrich data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false: unknown);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
        >
          <Search className='mr-2 h-4 w-4' />
          Enrich Data
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enrich Data with AI</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <label
              htmlFor='websiteUrl'
              className='text-sm font-medium'
            >
              Website URL (Optional: unknown)
            </label>
            <Input
              id='websiteUrl'
              placeholder='Enter website URL to scrape'
              value={websiteUrl}
              onChange={(e: unknown) => setWebsiteUrl(e.target.value)}
            />
            <p className='text-sm text-gray-500'>
              Enter a URL to extract additional information, or leave blank to use AI insights only.
            </p>
          </div>
          <Button
            onClick={handleEnrich}
            disabled={isLoading}
            className='w-full'
          >
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isLoading ? 'Enriching...' : 'Start Enrichment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
