'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'

export function EnrichmentClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[] | null>(null)

  const handleEnrich = async () => {
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    try {
      setLoading(true)
      setError(null)
      // TODO: Implement enrichment API call
      const mockResults = [
        { id: 1, name: 'Result 1' },
        { id: 2, name: 'Result 2' },
      ]
      setResults(mockResults)
    } catch (err) {
      const error = err as Error
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className='container mx-auto py-6'>
        <h1 className='mb-6 text-2xl font-bold'>Data Enrichment</h1>

        <Card className='p-6'>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='query'>Search Query</Label>
              <Input
                id='query'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Enter your search query...'
              />
            </div>

            <Button onClick={handleEnrich} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>

            {error && <Alert variant='destructive'>{error}</Alert>}

            {results && (
              <div className='mt-6'>
                <h2 className='mb-4 text-lg font-semibold'>Results</h2>
                <div className='space-y-4'>
                  {results.map((result) => (
                    <Card key={result.id} className='p-4'>
                      <h3 className='font-medium'>{result.name}</h3>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
