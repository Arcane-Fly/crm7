'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLMS } from '@/lib/hooks/use-lms'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

const enrollmentSchema = z.object({
  course_id: z.string().min(1, 'Course is required'),
  start_date: z.string().min(1, 'Start date is required'),
})

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>

interface EnrollmentFormProps {
  enrollment?: Enrollment
  onSuccess?: () => void
}

export function EnrollmentForm({ enrollment, onSuccess }: EnrollmentFormProps) {
  const { courses, actions } = useLMS()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: enrollment || {
      course_id: '',
      start_date: new Date().toISOString().split('T')[0],
    },
  })

  const onSubmit = async (values: EnrollmentFormValues) => {
    try {
      setIsSubmitting(true)
      if (enrollment?.id) {
        await actions.updateEnrollment({
          id: enrollment.id,
          data: values,
        })
      } else {
        await actions.enrollInCourse(values)
      }
      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="course_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.data?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {enrollment?.id ? 'Update Enrollment' : 'Create Enrollment'}
        </Button>
      </form>
    </Form>
  )
}
