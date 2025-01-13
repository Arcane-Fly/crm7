'use client'

import { useState } from 'react'
import { RatesCalculator } from '@/lib/services/rates-calc'
import { FairworkService } from '@/lib/services/fairwork'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface QuoteGeneratorProps {
  hostEmployerId: string
  onQuoteGenerated?: (quote: any) => void
}

export function QuoteGenerator({ hostEmployerId, onQuoteGenerated }: QuoteGeneratorProps) {
  const [baseRate, setBaseRate] = useState('')
  const [awardCode, setAwardCode] = useState('')
  const [classification, setClassification] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quote, setQuote] = useState<any>(null)

  const calculator = new RatesCalculator()
  const fairwork = new FairworkService()

  const handleGenerateQuote = async () => {
    try {
      setIsLoading(true)

      // Get award rates
      const awardRates = await fairwork.getAwardRates(awardCode, classification)

      // Calculate charge rate
      const calculation = calculator.calculateChargeRate(
        Number(baseRate),
        [
          { name: 'Casual Loading', rate: 0.25, type: 'loading' },
          { name: 'Annual Leave', rate: 0.0769, type: 'loading' },
          // Add more components based on award rates
        ]
      )

      // Generate quote
      const quoteData = calculator.generateQuote(calculation)
      setQuote(quoteData)
      onQuoteGenerated?.(quoteData)

    } catch (error) {
      console.error('Error generating quote:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Quote</CardTitle>
          <CardDescription>
            Calculate charge rates based on award rates and business costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="award">Award</Label>
              <Select value={awardCode} onValueChange={setAwardCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select award" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MA000003">Fast Food Industry Award</SelectItem>
                  <SelectItem value="MA000004">General Retail Industry Award</SelectItem>
                  {/* Add more awards */}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classification">Classification</Label>
              <Select value={classification} onValueChange={setClassification}>
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level1">Level 1</SelectItem>
                  <SelectItem value="level2">Level 2</SelectItem>
                  {/* Add more classifications */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseRate">Base Rate ($/hr)</Label>
            <Input
              id="baseRate"
              type="number"
              value={baseRate}
              onChange={(e) => setBaseRate(e.target.value)}
              placeholder="Enter base rate"
            />
          </div>
          <Button onClick={handleGenerateQuote} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Quote
          </Button>
        </CardContent>
      </Card>

      {quote && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Hourly Rate</p>
                  <p className="text-2xl font-bold">
                    ${quote.summary.totalRate.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Weekly Rate (38hrs)</p>
                  <p className="text-2xl font-bold">
                    ${quote.summary.weeklyRate.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Breakdown</p>
                <div className="space-y-1">
                  {Object.entries(quote.breakdown).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>${value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
