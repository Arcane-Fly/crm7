'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/context';
import { useLMS } from '@/lib/hooks/use-lms';

const enrollmentSchema = z.object({
  student_id: z.string().min(1, 'Student ID is required'),
  course_id: z.string().min(1, 'Course ID is required'),
  status: z.enum(['active', 'completed', 'withdrawn']),
  progress: z.number().min(0).max(100),
  grade: z.number().min(0).max(100).optional(),
});

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  enrollmentId?: string;
  defaultValues?: EnrollmentFormValues;
  onSuccess?: () => void;
}

export function EnrollmentForm({ enrollmentId, defaultValues, onSuccess }: EnrollmentFormProps) {
  const { user } = useAuth();
  const { createEnrollment, updateEnrollment, isCreatingEnrollment, isUpdatingEnrollment } =
    useLMS();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: defaultValues || {
      student_id: '',
      course_id: '',
      status: 'active',
      progress: 0,
      grade: undefined,
    },
  });

  const onSubmit = async (values: EnrollmentFormValues) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      if (enrollmentId) {
        await updateEnrollment(enrollmentId, values);
        toast({
          title: 'Enrollment updated',
          description: 'The enrollment has been updated successfully.',
        });
      } else {
        await createEnrollment({
          ...values,
          org_id: user.org_id,
          user_id: user.id,
          start_date: new Date().toISOString(),
        });
        toast({
          title: 'Enrollment created',
          description: 'The enrollment has been created successfully.',
        });
      }
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save enrollment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='p-6'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FormField
            control={form.control}
            name='student_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='course_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='status'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                  >
                    <option value='active'>Active</option>
                    <option value='completed'>Completed</option>
                    <option value='withdrawn'>Withdrawn</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='progress'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress (%)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='grade'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade (%)</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            disabled={isSubmitting || isCreatingEnrollment || isUpdatingEnrollment}
          >
            {isSubmitting || isCreatingEnrollment || isUpdatingEnrollment
              ? enrollmentId
                ? 'Updating...'
                : 'Creating...'
              : enrollmentId
                ? 'Update Enrollment'
                : 'Create Enrollment'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
