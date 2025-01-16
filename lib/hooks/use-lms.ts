import { useSupabaseQuery, useSupabaseMutation } from '@/lib/hooks/use-query-with-supabase'
import type { Course } from '@/lib/services/lms'

export function useLMS() {
  const useAssessments = () => {
    return useSupabaseQuery({
      queryKey: ['assessments'],
      table: 'assessments',
    })
  }

  const useCourses = () => {
    return useSupabaseQuery({
      queryKey: ['courses'],
      table: 'courses',
    })
  }

  const useEnrollments = () => {
    return useSupabaseQuery({
      queryKey: ['enrollments'],
      table: 'enrollments',
    })
  }

  const createCourse = async (data: Omit<Course, 'id'>) => {
    const mutation = useSupabaseMutation<Course>({
      table: 'courses',
      type: 'insert',
    })
    return mutation.mutate(data)
  }

  const updateCourse = async ({ id, data }: { id: string; data: Partial<Course> }) => {
    const mutation = useSupabaseMutation<Course>({
      table: 'courses',
      type: 'update',
    })
    return mutation.mutate({ id, data })
  }

  return {
    useAssessments,
    useCourses,
    useEnrollments,
    actions: {
      createCourse,
      updateCourse,
    }
  }
}
