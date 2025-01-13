'use client'

import { useRealtimeData } from '@/lib/hooks/useRealtimeData'
import { createTimeEntry } from '@/lib/supabase/utils'

interface TimeEntry {
  id: string
  employee_id: string
  start_time: string
  end_time: string
  break_duration: number
  status: 'pending' | 'approved' | 'rejected'
}

export function TimeEntriesList({ employeeId }: { employeeId: string }) {
  const { data: timeEntries, isLoading, error } = useRealtimeData<TimeEntry>(
    'time_entries',
    [],
    { column: 'employee_id', value: employeeId }
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const handleAddEntry = async () => {
    try {
      await createTimeEntry({
        employee_id: employeeId,
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        break_duration: 0,
        status: 'pending',
      })
    } catch (err) {
      console.error('Error adding time entry:', err)
    }
  }

  return (
    <div>
      <h2>Time Entries</h2>
      <button onClick={handleAddEntry}>Add Entry</button>
      <ul>
        {timeEntries.map((entry) => (
          <li key={entry.id}>
            {new Date(entry.start_time).toLocaleString()} -{' '}
            {new Date(entry.end_time).toLocaleString()}
            <span>Status: {entry.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
