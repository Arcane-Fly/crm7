import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuery, useSupabaseMutation } from '@/lib/hooks/use-supabase-query';
import type { Database } from '@/types/supabase-generated';

type Tables = Database['public']['Tables'];
export type Course = Tables['courses']['Row'];
export type CourseInsert = Tables['courses']['Insert'];
export type Enrollment = Tables['enrollments']['Row'];
export type EnrollmentInsert = Tables['enrollments']['Insert'];

export function useLMS() {
  const { toast } = useToast();

  // Queries
  const courses = useSupabaseQuery({
    queryKey: ['courses'],
    table: 'courses',
  });

  const enrollments = useSupabaseQuery({
    queryKey: ['enrollments'],
    table: 'enrollments',
  });

  // Course Mutations
  const { mutateAsync: createCourse, isPending: isCreatingCourse } = useSupabaseMutation({
    table: 'courses',
    onSuccess: () => {
      toast({
        title: 'Course created',
        description: 'The course has been created successfully.',
      });
      courses.refetch();
    },
  });

  const { mutateAsync: updateCourse, isPending: isUpdatingCourse } = useSupabaseMutation({
    table: 'courses',
    onSuccess: () => {
      toast({
        title: 'Course updated',
        description: 'The course has been updated successfully.',
      });
      courses.refetch();
    },
  });

  // Enrollment Mutations
  const { mutateAsync: createEnrollment, isPending: isCreatingEnrollment } = useSupabaseMutation({
    table: 'enrollments',
    onSuccess: () => {
      toast({
        title: 'Enrollment created',
        description: 'The enrollment has been created successfully.',
      });
      enrollments.refetch();
    },
  });

  const { mutateAsync: updateEnrollment, isPending: isUpdatingEnrollment } = useSupabaseMutation({
    table: 'enrollments',
    onSuccess: () => {
      toast({
        title: 'Enrollment updated',
        description: 'The enrollment has been updated successfully.',
      });
      enrollments.refetch();
    },
  });

  return {
    // Queries
    courses,
    enrollments,

    // Course Mutations
    createCourse: (data: CourseInsert) => createCourse({ data }),
    updateCourse: (id: string, data: Partial<CourseInsert>) =>
      updateCourse({ match: { id }, data }),
    isCreatingCourse,
    isUpdatingCourse,

    // Enrollment Mutations
    createEnrollment: (data: EnrollmentInsert) => createEnrollment({ data }),
    updateEnrollment: (id: string, data: Partial<EnrollmentInsert>) =>
      updateEnrollment({ match: { id }, data }),
    isCreatingEnrollment,
    isUpdatingEnrollment,
  };
}
