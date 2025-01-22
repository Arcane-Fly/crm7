import { useSupabaseQuery } from '@/lib/hooks/use-supabase-query'
import type { Enrollment } from '@/lib/types/lms'

export function EnrollmentList() {
  const { data: enrollments } = useSupabaseQuery<'enrollments'>({
    table: 'enrollments',
    queryKey: ['enrollments'],
    select: '*',
    order: [{ column: 'created_at', ascending: false }]
  })

  return (
    <div>
      {enrollments?.map((enrollment: Enrollment) => (
        <div key={enrollment.id}>
          <h3>Course: {enrollment.course_id}</h3>
          <p>Status: {enrollment.status}</p>
          <p>Progress: {enrollment.progress}%</p>
        </div>
      ))}
    </div>
  )
}
