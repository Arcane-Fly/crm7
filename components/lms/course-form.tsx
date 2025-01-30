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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/context';
import { useLMS } from '@/lib/hooks/use-lms';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  courseId?: string;
  defaultValues?: CourseFormValues;
  onSuccess?: () => void;
}

export function CourseForm({ courseId, defaultValues, onSuccess }: CourseFormProps) {
  const { user } = useAuth();
  const { createCourse, updateCourse, isCreatingCourse, isUpdatingCourse } = useLMS();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      instructor: '',
      start_date: '',
      end_date: '',
    },
  });

  const onSubmit = async (values: CourseFormValues) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      if (courseId) {
        await updateCourse(courseId, values);
        toast({
          title: 'Course updated',
          description: 'The course has been updated successfully.',
        });
      } else {
        await createCourse({
          ...values,
          org_id: user.org_id,
          status: 'active',
          duration: 0, // Default duration
          level: 'beginner', // Default level
        });
        toast({
          title: 'Course created',
          description: 'The course has been created successfully.',
        });
      }
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save course. Please try again.',
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
            name='title'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='instructor'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='start_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='end_date'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type='date'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type='submit'
            disabled={isSubmitting || isCreatingCourse || isUpdatingCourse}
          >
            {isSubmitting || isCreatingCourse || isUpdatingCourse
              ? courseId
                ? 'Updating...'
                : 'Creating...'
              : courseId
                ? 'Update Course'
                : 'Create Course'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
