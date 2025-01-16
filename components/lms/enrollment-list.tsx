'use client'

import * as React from 'react'
import { useLMS } from '@/lib/hooks/use-lms'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Eye, Edit, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import { Progress } from '@/components/ui/progress'

export function EnrollmentList() {
  const { enrollments, actions } = useLMS()
  const { toast } = useToast()
  const [selectedEnrollment, setSelectedEnrollment] = React.useState<Enrollment | null>(null)

  const columns = [
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => formatDate(row.original.start_date),
    },
    {
      accessorKey: 'course_id',
      header: 'Course',
      cell: ({ row }) => {
        const course = enrollments.data?.find(e => e.course_id === row.original.course_id)
        return course?.title || row.original.course_id
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'completed'
              ? 'success'
              : row.original.status === 'failed'
              ? 'destructive'
              : 'default'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="w-full max-w-xs">
          <Progress
            value={row.original.progress}
            className="h-2"
            aria-label="Course progress"
          />
          <span className="text-xs text-muted-foreground">
            {row.original.progress}%
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedEnrollment(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleUpdateProgress(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.original.progress === 100 && row.original.status !== 'completed' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleComplete(row.original)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const handleUpdateProgress = async (enrollment: Enrollment) => {
    try {
      const newProgress = Math.min(100, enrollment.progress + 10)
      await actions.updateProgress({
        id: enrollment.id,
        progress: newProgress,
      })
      toast({
        title: 'Progress updated',
        description: 'The enrollment progress has been updated.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      })
    }
  }

  const handleComplete = async (enrollment: Enrollment) => {
    try {
      await actions.updateProgress({
        id: enrollment.id,
        progress: 100,
        status: 'completed',
      })
      toast({
        title: 'Course completed',
        description: 'The course has been marked as completed.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete course',
        variant: 'destructive',
      })
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Enrollments</h2>
          <Button onClick={() => setSelectedEnrollment({} as Enrollment)}>
            New Enrollment
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={enrollments.data || []}
          loading={enrollments.isLoading}
        />

        <Dialog
          open={!!selectedEnrollment}
          onOpenChange={(open) => !open && setSelectedEnrollment(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedEnrollment?.id ? 'Update Enrollment' : 'New Enrollment'}
              </DialogTitle>
            </DialogHeader>
            {/* TODO: Add EnrollmentForm component */}
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
