'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type TrainingPlan = {
  id: string
  apprenticeName: string
  qualification: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'completed'
  progress: number
  nextReview: string
}

export const columns: ColumnDef<TrainingPlan>[] = [
  {
    accessorKey: 'apprenticeName',
    header: 'Apprentice',
  },
  {
    accessorKey: 'qualification',
    header: 'Qualification',
  },
  {
    accessorKey: 'startDate',
    header: 'Start Date',
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const progress = row.getValue('progress') as number
      return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className={`capitalize ${
          status === 'active' ? 'text-green-600' : 
          status === 'completed' ? 'text-blue-600' : 
          'text-yellow-600'
        }`}>
          {status}
        </div>
      )
    },
  },
  {
    accessorKey: 'nextReview',
    header: 'Next Review',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const plan = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Plan</DropdownMenuItem>
            <DropdownMenuItem>Schedule Review</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
