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

export type ProgressReview = {
  id: string
  apprenticeName: string
  reviewDate: string
  reviewType: 'quarterly' | 'mid-term' | 'final'
  status: 'scheduled' | 'completed' | 'cancelled'
  reviewer: string
  completedUnits: number
  totalUnits: number
  concerns: boolean
}

export const columns: ColumnDef<ProgressReview>[] = [
  {
    accessorKey: 'apprenticeName',
    header: 'Apprentice',
  },
  {
    accessorKey: 'reviewDate',
    header: 'Review Date',
  },
  {
    accessorKey: 'reviewType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('reviewType') as string
      return <div className="capitalize">{type}</div>
    },
  },
  {
    accessorKey: 'reviewer',
    header: 'Reviewer',
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const completed = row.original.completedUnits
      const total = row.original.totalUnits
      const percentage = (completed / total) * 100
      return (
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">
            {completed}/{total}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'concerns',
    header: 'Concerns',
    cell: ({ row }) => {
      const concerns = row.getValue('concerns') as boolean
      return (
        <div className={concerns ? 'text-red-600' : 'text-green-600'}>
          {concerns ? 'Yes' : 'No'}
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
          status === 'completed' ? 'text-green-600' : 
          status === 'scheduled' ? 'text-blue-600' : 
          'text-red-600'
        }`}>
          {status}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const review = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Complete Review</DropdownMenuItem>
            <DropdownMenuItem>Reschedule</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
