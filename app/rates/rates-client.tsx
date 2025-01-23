'use client'

import { useUser } from '@/lib/hooks/use-user'
import { RateCalculator } from '@/components/rates/RateCalculator'
import { RateTemplateBuilder } from '@/components/rates/RateTemplateBuilder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function RatesClient() {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
    <div className='container mx-auto py-10'>
      <Tabs defaultValue='calculator' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='calculator'>Rate Calculator</TabsTrigger>
          <TabsTrigger value='templates'>Rate Templates</TabsTrigger>
        </TabsList>
        <TabsContent value='calculator' className='space-y-4'>
          <RateCalculator org_id={user.org_id} />
        </TabsContent>
        <TabsContent value='templates' className='space-y-4'>
          <RateTemplateBuilder />
        </TabsContent>
      </Tabs>
    </div>
  )
}
