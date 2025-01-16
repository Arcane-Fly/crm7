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

  return {
    useAssessments,
    useCourses,
    useEnrollments,
  }
}
