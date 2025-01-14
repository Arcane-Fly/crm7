import { useState, useEffect } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'

export default function EnrichmentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Fetch enrichment data here
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='container mx-auto py-6'>
      <Breadcrumb items={[{ label: 'Enrichment', href: '/enrichment' }]} />

      <h1 className='mb-4 mt-6 text-2xl font-bold'>Data Enrichment</h1>

      <div className='grid gap-6'>
        <Card className='p-6'>
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className='text-red-500'>{error.message}</div>
          ) : (
            <div>Enrichment content goes here</div>
          )}
        </Card>
      </div>
    </div>
  )
}
