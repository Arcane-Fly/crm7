import { useSupabaseQuery, useSupabaseMutation } from '@/lib/hooks/use-supabase-query'
import type { Database } from '@/types/supabase'
import { useToast } from '@/components/ui/use-toast'

type Tables = Database['public']['Tables']
type Course = Tables['courses']['Row']
type Enrollment = Tables['enrollments']['Row']
type Assessment = Tables['assessments']['Row']
type Unit = Tables['units']['Row']

export function useLMS() {
  const { toast } = useToast()

  // Queries
  const courses = useSupabaseQuery<'courses'>({
    queryKey: ['courses'],
    table: 'courses',
  })

  const enrollments = useSupabaseQuery<'enrollments'>({
    queryKey: ['enrollments'],
    table: 'enrollments',
  })

  const assessments = useSupabaseQuery<'assessments'>({
    queryKey: ['assessments'],
    table: 'assessments',
  })

  const units = useSupabaseQuery<'units'>({
    queryKey: ['units'],
    table: 'units',
  })

  // Course Mutations
  const { mutate: createCourseMutation, isPending: isCreatingCourse } =
    useSupabaseMutation<'courses'>({
      table: 'courses',
      onSuccess: () => {
        toast({
          title: 'Course created',
          description: 'The course has been created successfully.',
        })
        courses.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create course. Please try again.',
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateCourseMutation, isPending: isUpdatingCourse } =
    useSupabaseMutation<'courses'>({
      table: 'courses',
      onSuccess: () => {
        toast({
          title: 'Course updated',
          description: 'The course has been updated successfully.',
        })
        courses.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update course. Please try again.',
          variant: 'destructive',
        })
      },
    })

  const { mutate: deleteCourseMutation, isPending: isDeletingCourse } =
    useSupabaseMutation<'courses'>({
      table: 'courses',
      onSuccess: () => {
        toast({
          title: 'Course deleted',
          description: 'The course has been deleted successfully.',
        })
        courses.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete course. Please try again.',
          variant: 'destructive',
        })
      },
    })

  // Enrollment Mutations
  const { mutate: createEnrollmentMutation, isPending: isCreatingEnrollment } =
    useSupabaseMutation<'enrollments'>({
      table: 'enrollments',
      onSuccess: () => {
        toast({
          title: 'Enrollment created',
          description: 'The enrollment has been created successfully.',
        })
        enrollments.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create enrollment. Please try again.',
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateEnrollmentMutation, isPending: isUpdatingEnrollment } =
    useSupabaseMutation<'enrollments'>({
      table: 'enrollments',
      onSuccess: () => {
        toast({
          title: 'Enrollment updated',
          description: 'The enrollment has been updated successfully.',
        })
        enrollments.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update enrollment. Please try again.',
          variant: 'destructive',
        })
      },
    })

  const { mutate: deleteEnrollmentMutation, isPending: isDeletingEnrollment } =
    useSupabaseMutation<'enrollments'>({
      table: 'enrollments',
      onSuccess: () => {
        toast({
          title: 'Enrollment deleted',
          description: 'The enrollment has been deleted successfully.',
        })
        enrollments.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete enrollment. Please try again.',
          variant: 'destructive',
        })
      },
    })

  // Assessment Mutations
  const { mutate: createAssessmentMutation, isPending: isCreatingAssessment } =
    useSupabaseMutation<'assessments'>({
      table: 'assessments',
      onSuccess: () => {
        toast({
          title: 'Assessment created',
          description: 'The assessment has been created successfully.',
        })
        assessments.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create assessment. Please try again.',
          variant: 'destructive',
        })
      },
    })

  const { mutate: updateAssessmentMutation, isPending: isUpdatingAssessment } =
    useSupabaseMutation<'assessments'>({
      table: 'assessments',
      onSuccess: () => {
        toast({
          title: 'Assessment updated',
          description: 'The assessment has been updated successfully.',
        })
        assessments.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to update assessment. Please try again.',
          variant: 'destructive',
        })
      },
    })

  const { mutate: deleteAssessmentMutation, isPending: isDeletingAssessment } =
    useSupabaseMutation<'assessments'>({
      table: 'assessments',
      onSuccess: () => {
        toast({
          title: 'Assessment deleted',
          description: 'The assessment has been deleted successfully.',
        })
        assessments.refetch()
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete assessment. Please try again.',
          variant: 'destructive',
        })
      },
    })

  // Unit Mutations
  const { mutate: createUnitMutation, isPending: isCreatingUnit } = useSupabaseMutation<'units'>({
    table: 'units',
    onSuccess: () => {
      toast({
        title: 'Unit created',
        description: 'The unit has been created successfully.',
      })
      units.refetch()
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create unit. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const { mutate: updateUnitMutation, isPending: isUpdatingUnit } = useSupabaseMutation<'units'>({
    table: 'units',
    onSuccess: () => {
      toast({
        title: 'Unit updated',
        description: 'The unit has been updated successfully.',
      })
      units.refetch()
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update unit. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const { mutate: deleteUnitMutation, isPending: isDeletingUnit } = useSupabaseMutation<'units'>({
    table: 'units',
    onSuccess: () => {
      toast({
        title: 'Unit deleted',
        description: 'The unit has been deleted successfully.',
      })
      units.refetch()
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete unit. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const createCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
    return createCourseMutation({ data: courseData })
  }

  const updateCourse = async (
    id: string,
    courseData: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    return updateCourseMutation({ match: { id }, data: courseData })
  }

  const deleteCourse = async (id: string) => {
    return deleteCourseMutation({ match: { id }, data: {} })
  }

  const createEnrollment = async (
    enrollmentData: Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    return createEnrollmentMutation({ data: enrollmentData })
  }

  const updateEnrollment = async (
    id: string,
    enrollmentData: Partial<Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    return updateEnrollmentMutation({ match: { id }, data: enrollmentData })
  }

  const deleteEnrollment = async (id: string) => {
    return deleteEnrollmentMutation({ match: { id }, data: {} })
  }

  const createAssessment = async (
    assessmentData: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>
  ) => {
    return createAssessmentMutation({ data: assessmentData })
  }

  const updateAssessment = async (
    id: string,
    assessmentData: Partial<Omit<Assessment, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    return updateAssessmentMutation({ match: { id }, data: assessmentData })
  }

  const deleteAssessment = async (id: string) => {
    return deleteAssessmentMutation({ match: { id }, data: {} })
  }

  const createUnit = async (unitData: Omit<Unit, 'id' | 'created_at' | 'updated_at'>) => {
    return createUnitMutation({ data: unitData })
  }

  const updateUnit = async (
    id: string,
    unitData: Partial<Omit<Unit, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    return updateUnitMutation({ match: { id }, data: unitData })
  }

  const deleteUnit = async (id: string) => {
    return deleteUnitMutation({ match: { id }, data: {} })
  }

  return {
    // Queries
    courses,
    enrollments,
    assessments,
    units,

    // Course Mutations
    createCourse,
    updateCourse,
    deleteCourse,
    isCreatingCourse,
    isUpdatingCourse,
    isDeletingCourse,

    // Enrollment Mutations
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    isCreatingEnrollment,
    isUpdatingEnrollment,
    isDeletingEnrollment,

    // Assessment Mutations
    createAssessment,
    updateAssessment,
    deleteAssessment,
    isCreatingAssessment,
    isUpdatingAssessment,
    isDeletingAssessment,

    // Unit Mutations
    createUnit,
    updateUnit,
    deleteUnit,
    isCreatingUnit,
    isUpdatingUnit,
    isDeletingUnit,
  }
}
