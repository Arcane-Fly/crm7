import { useToast } from '@/components/ui/use-toast';
import { useSupabaseQuery, useSupabaseMutation } from '@/lib/hooks/use-supabase-query';
import type { Course, Enrollment, CourseCreate, EnrollmentCreate } from '@/lib/types/lms';

export function useLMS() {
  const { toast } = useToast();

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
  const { mutateAsync: createEnrollment, isPending: isCreatingEnrollment } =
    useSupabaseMutation<Enrollment>({
      table: 'enrollments',
      onSuccess: () => {
        toast({
          title: 'Enrollment created',
          description: 'The enrollment has been created successfully.',
        });
        enrollments.refetch();
      },
    });

  const { mutateAsync: updateEnrollment, isPending: isUpdatingEnrollment } =
    useSupabaseMutation<Enrollment>({
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
    createCourse: (data: CourseCreate) => createCourse({ data }),
    updateCourse: (id: string, data: Partial<CourseCreate>) =>
      updateCourse({ match: { id }, data }),
    isCreatingCourse,
    isUpdatingCourse,

    // Enrollment Mutations
    createEnrollment: (data: EnrollmentCreate) => createEnrollment({ data }),
    updateEnrollment: (id: string, data: Partial<EnrollmentCreate>) =>
      updateEnrollment({ match: { id }, data }),
    isCreatingEnrollment,
    isUpdatingEnrollment,
  };
}
