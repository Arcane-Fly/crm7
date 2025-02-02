'use client';

import { type ReactElement } from 'react';

import { RateCalculator } from '@/components/rates/RateCalculator';
import { RateTemplateBuilder } from '@/components/rates/RateTemplateBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/lib/hooks/use-user';
import { createClient } from '@/lib/supabase/client';

export function RatesClient(): ReactElement {
  const { user } = useUser();
  const supabase = createClient();

  if (!user) {
    return <div>Please log in to access rates</div>;
  }

  return (
    <div className='container mx-auto py-10'>
      <Tabs
        defaultValue='calculator'
        className='space-y-4'
      >
        <TabsList>
          <TabsTrigger value='calculator'>Rate Calculator</TabsTrigger>
          <TabsTrigger value='templates'>Rate Templates</TabsTrigger>
        </TabsList>
        <TabsContent
          value='calculator'
          className='space-y-4'
        >
          <RateCalculator orgId={user.org_id} />
        </TabsContent>
        <TabsContent
          value='templates'
          className='space-y-4'
        >
          <RateTemplateBuilder supabase={supabase} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
