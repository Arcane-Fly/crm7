'use client'

import * as React from 'react'
import { useLMS } from '@/lib/hooks/use-lms'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Eye, Edit, Archive } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'

export function CourseList() {
  const { courses, actions } = useLMS()
  const { toast } = useToast()
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null)

  const columns = [
    {
      accessorKey: 'title',
      header: 'Course Title',
    },
    {
      accessorKey: 'level',
      header: 'Level',
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.original.level}
        </Badge>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration (hours)',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'active'
              ? 'success'
              : row.original.status === 'archived'
              ? 'secondary'
              : 'default'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedCourse(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.original.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleArchive(row.original)}
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const handleEdit = async (course: Course) => {
    // TODO: Implement edit functionality
    toast({
      title: 'Not implemented',
      description: 'Course editing will be available soon.',
    })
  }

  const handleArchive = async (course: Course) => {
    try {
      await actions.updateCourse({
        id: course.id,
        data: {
          status: 'archived',
        },
      })
      toast({
        title: 'Course archived',
        description: 'The course has been archived successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive course',
        variant: 'destructive',
      })
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Courses</h2>
          <Button onClick={() => setSelectedCourse({} as Course)}>
            Add Course
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={courses.data || []}
          loading={courses.isLoading}
        />

        <Dialog
          open={!!selectedCourse}
          onOpenChange={(open) => !open && setSelectedCourse(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCourse?.id ? 'Edit Course' : 'Add Course'}
              </DialogTitle>
            </DialogHeader>
            {/* TODO: Add CourseForm component */}
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  )
}
