import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ratesService } from '@/lib/services/rates'
import { useToast } from '@/components/ui/use-toast'

interface QuoteGeneratorProps {
  orgId: string
}

export function QuoteGenerator({ orgId }: QuoteGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const { toast } = useToast()

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await ratesService.getTemplates(orgId)
      setTemplates(data)
    } catch (err) {
      setError(err as Error)
      toast({
        title: 'Error',
        description: 'Failed to load templates',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [orgId, toast])

  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  const handleGenerateQuote = async (templateId: string) => {
    try {
      setIsLoading(true)
      await ratesService.generateQuote(templateId)
      toast({
        title: 'Success',
        description: 'Quote generated successfully',
      })
    } catch (err) {
      setError(err as Error)
      toast({
        title: 'Error',
        description: 'Failed to generate quote',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading templates...</div>
  }

  if (error) {
    return <div className='text-red-500'>{error.message}</div>
  }

  return (
    <div className='grid gap-6'>
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Available Templates</h3>
        <div className='space-y-4'>
          {templates.map((template) => (
            <div key={template.id} className='flex items-center justify-between border-b pb-2'>
              <div>
                <p className='font-medium'>{template.name}</p>
                <p className='text-sm text-gray-500'>
                  Last updated: {new Date(template.updated_at).toLocaleDateString()}
                </p>
              </div>
              <Button onClick={() => handleGenerateQuote(template.id)} disabled={isLoading}>
                Generate Quote
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
