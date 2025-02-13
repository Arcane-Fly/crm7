import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuery, useSupabaseMutation } from '@/lib/hooks/use-supabase-query';
import type { Course, CourseInsert, Enrollment, EnrollmentInsert } from '@/lib/types/lms';
import { createClient } from '@/lib/supabase';

export function useLMS() {
  const { toast } = useToast();
  const supabase = createClient();

  // Queries
  const courses = useSupabaseQuery<Course[]>({
    queryKey: ['courses'],
    table: 'courses',
  });

  const enrollments = useSupabaseQuery<Enrollment[]>({
    queryKey: ['enrollments'],
    table: 'enrollments',
  });

  // Course Mutations
  const { mutateAsync: createCourse, isPending: isCreatingCourse } = useSupabaseMutation<Course>({
    table: 'courses',
    onSuccess: () => {
      toast({
        title: 'Course created',
        description: 'The course has been created successfully.',
      });
      courses.refetch();
    },
  });

  const { mutateAsync: updateCourse, isPending: isUpdatingCourse } = useSupabaseMutation<Course>({
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
  const { mutateAsync: createEnrollment, isPending: isCreatingEnrollment } = useSupabaseMutation<Enrollment>({
    table: 'enrollments',
    onSuccess: () => {
      toast({
        title: 'Enrollment created',
        description: 'The enrollment has been created successfully.',
      });
      enrollments.refetch();
    },
  });

  const { mutateAsync: updateEnrollment, isPending: isUpdatingEnrollment } = useSupabaseMutation<Enrollment>({
    table: 'enrollments',
    onSuccess: () => {
      toast({
        title: 'Enrollment updated',
        description: 'The enrollment has been updated successfully.',
      });
      enrollments.refetch();
    },
  });

  const deleteEnrollment = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Enrollment deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete enrollment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete enrollment',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    // Queries
    courses,
    enrollments,

    // Course Mutations
    createCourse,
    updateCourse,
    isCreatingCourse,
    isUpdatingCourse,

    // Enrollment Mutations
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    isCreatingEnrollment,
    isUpdatingEnrollment,
  };
}
