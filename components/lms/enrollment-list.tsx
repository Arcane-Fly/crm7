'use client'

import { useLMS } from '@/lib/hooks/use-lms'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Loader2, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export function EnrollmentList() {
  const router = useRouter()
  const { enrollments, updateEnrollment, isUpdatingEnrollment } = useLMS()
  const { toast } = useToast()

  const onWithdraw = async (id: string) => {
    try {
      await updateEnrollment({
        match: { id },
        data: { status: 'withdrawn' },
      })
      toast({
        title: 'Enrollment withdrawn',
        description: 'The enrollment has been withdrawn successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to withdraw enrollment. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (enrollments.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (enrollments.isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Failed to load enrollments</p>
        <Button variant="outline" onClick={() => enrollments.refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {enrollments.data?.map((enrollment) => (
        <Card key={enrollment.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Student ID: {enrollment.student_id}</CardTitle>
                <CardDescription>Course ID: {enrollment.course_id}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isUpdatingEnrollment}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/enrollments/${enrollment.id}`)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/enrollments/${enrollment.id}/edit`)}>
                    Edit Enrollment
                  </DropdownMenuItem>
                  {enrollment.status === 'active' && (
                    <DropdownMenuItem onClick={() => onWithdraw(enrollment.id)}>
                      Withdraw Enrollment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    enrollment.status === 'active'
                      ? 'default'
                      : enrollment.status === 'completed'
                      ? 'success'
                      : 'secondary'
                  }
                >
                  {enrollment.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span>{enrollment.progress}%</span>
                </div>
                {enrollment.grade !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span>Grade:</span>
                    <span>{enrollment.grade}%</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{format(new Date(enrollment.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span>{format(new Date(enrollment.updated_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
