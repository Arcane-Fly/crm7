'use client';

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/lib/hooks/use-supabase';
import type { Database } from '@/lib/types/database';

type ApprenticeQualificationRow = Database['public']['Tables']['apprentice_qualifications']['Row'];

export function EnrollmentList(): React.ReactElement {
  const { supabase } = useSupabase();
  const { data: enrollments } = useQuery({
    queryKey: ['apprentice_qualifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apprentice_qualifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error: unknown) throw error;
      return data as ApprenticeQualificationRow[];
    },
  });

  return (
    <div>
      {enrollments?.map((enrollment: ApprenticeQualificationRow) => (
        <div key={enrollment.id}>
          <h3>Qualification: {enrollment.qualification_id}</h3>
          <p>Apprentice: {enrollment.apprentice_id}</p>
          <p>Status: {enrollment.status}</p>
          <p>Started: {enrollment.start_date}</p>
        </div>
      ))}
    </div>
  );
}
