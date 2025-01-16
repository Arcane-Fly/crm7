import { useSupabaseQuery, useSupabaseMutation } from './use-query-with-supabase'
import type { Course, Enrollment, Assessment } from '@/lib/services/lms'
import { useAuth } from '@/lib/auth/context'

export function useLMS() {
  const { user } = useAuth()

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useSupabaseQuery<Course>({
    queryKey: ['courses'],
    table: 'courses',
    filter: [{ column: 'status', value: 'active' }],
    enabled: !!user,
  })

  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
  } = useSupabaseQuery<Enrollment>({
    queryKey: ['enrollments', user?.id],
    table: 'enrollments',
    filter: user ? [{ column: 'user_id', value: user.id }] : undefined,
    enabled: !!user,
  })

  const { mutate: enrollInCourse } = useSupabaseMutation<Enrollment>({
    table: 'enrollments',
    type: 'insert',
    invalidateQueries: [['enrollments', user?.id]],
  })

  const { mutate: updateProgress } = useSupabaseMutation<Enrollment>({
    table: 'enrollments',
    type: 'update',
    invalidateQueries: [['enrollments', user?.id]],
  })

  const getAssessments = (courseId: string) => {
    return useSupabaseQuery<Assessment>({
      queryKey: ['assessments', courseId],
      table: 'assessments',
      filter: [{ column: 'course_id', value: courseId }],
      enabled: !!courseId,
    })
  }

  return {
    courses: {
      data: courses,
      isLoading: coursesLoading,
      error: coursesError,
    },
    enrollments: {
      data: enrollments,
      isLoading: enrollmentsLoading,
      error: enrollmentsError,
    },
    actions: {
      enrollInCourse,
      updateProgress,
      getAssessments,
    },
  }
}
