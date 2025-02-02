'use client';

import { format } from 'date-fns';
import { Loader2, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useLMS } from '@/lib/hooks/use-lms';
import type { Course } from '@/lib/types/lms';

export function CourseList(): void {
  const router = useRouter();
  const { courses, updateCourse, isUpdatingCourse } = useLMS();
  const { toast } = useToast();

  const onArchive = async (courseId: string) => {
    try {
      await updateCourse(courseId: unknown, { status: 'inactive' });
      toast({
        title: 'Course archived',
        description: 'The course has been archived successfully.',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: 'Failed to archive course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (courses.isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (courses.isError) {
    return (
      <div className='flex flex-col items-center justify-center p-8'>
        <p className='text-sm text-muted-foreground'>Failed to load courses</p>
        <Button
          variant='outline'
          onClick={() => courses.refetch()}
          className='mt-4'
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {courses.data?.map((item: unknown) => {
        const course = item as Course;
        return (
          <Card key={course.id}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>Instructor: {course.instructor}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      disabled={isUpdatingCourse}
                    >
                      <MoreVertical className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => router.push(`/courses/${course.id}`)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/courses/${course.id}/edit`)}>
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(course.id)}>
                      Archive Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <p className='text-sm text-muted-foreground'>{course.description}</p>
                <div className='flex items-center gap-2'>
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className='flex w-full items-center justify-between text-sm text-muted-foreground'>
                <div>Start: {format(new Date(course.start_date), 'MMM d, yyyy')}</div>
                <div>End: {format(new Date(course.end_date), 'MMM d, yyyy')}</div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
