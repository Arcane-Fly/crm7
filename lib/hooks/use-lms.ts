import { useSupabaseQuery } from './use-query-with-supabase'

export function useLMS() {
  const useAssessments = () => {
    return useSupabaseQuery({
      queryKey: ['assessments'],
      table: 'assessments',
    })
  }

  return {
    useAssessments,
  }
}
