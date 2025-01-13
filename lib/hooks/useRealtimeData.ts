import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../supabase/client'
import { Database } from '../types/database'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

export function useRealtimeData<T extends TableName>(
  tableName: T,
  filter?: {
    column: keyof Tables[T]['Row']
    value: any
  }
) {
  const [data, setData] = useState<Tables[T]['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    async function initializeData() {
      try {
        setLoading(true)
        let query = supabase.from(tableName).select('*')
        
        if (filter) {
          query = query.eq(filter.column as string, filter.value)
        }

        const { data: initialData, error: initialError } = await query

        if (initialError) throw initialError
        setData(initialData || [])

        // Set up real-time subscription
        channel = supabase
          .channel(`${tableName}_changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName,
              ...(filter && {
                filter: `${filter.column}=eq.${filter.value}`
              })
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setData((current) => [...current, payload.new as Tables[T]['Row']])
              } else if (payload.eventType === 'DELETE') {
                setData((current) =>
                  current.filter((item) => item.id !== payload.old.id)
                )
              } else if (payload.eventType === 'UPDATE') {
                setData((current) =>
                  current.map((item) =>
                    item.id === payload.new.id
                      ? (payload.new as Tables[T]['Row'])
                      : item
                  )
                )
              }
            }
          )
          .subscribe()

      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setLoading(false)
      }
    }

    initializeData()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [tableName, filter])

  return { data, loading, error }
}
