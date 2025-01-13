import { Metadata } from 'next'
import { RateCalculator } from '@/components/rates/RateCalculator'
import { RateTemplateBuilder } from '@/components/rates/RateTemplateBuilder'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Rate Calculator',
  description: 'Calculate and manage rates for apprentices, trainees, and employees'
}

export default function RatesPage() {
  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="calculator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calculator">Rate Calculator</TabsTrigger>
          <TabsTrigger value="templates">Rate Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="calculator" className="space-y-4">
          <RateCalculator />
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <RateTemplateBuilder />
        </TabsContent>
      </Tabs>
    </div>
  )
}
