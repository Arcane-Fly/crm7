'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Download } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Document = {
  id: string
  name: string
  type: string
  size: number
  uploadedBy: string
  uploadDate: string
  category: 'contract' | 'certificate' | 'report' | 'other'
  status: 'active' | 'archived'
  apprenticeId?: string
  apprenticeName?: string
}

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: 'Document Name',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      return <div className="capitalize">{category}</div>
    },
  },
  {
    accessorKey: 'apprenticeName',
    header: 'Related To',
  },
  {
    accessorKey: 'uploadedBy',
    header: 'Uploaded By',
  },
  {
    accessorKey: 'uploadDate',
    header: 'Upload Date',
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ row }) => {
      const size = row.getValue('size') as number
      const kb = size / 1024
      const mb = kb / 1024
      return <div>{mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`}</div>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <div className={`capitalize ${status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
          {status}
        </div>
      )
    },
  },
  {
    id: 'download',
    cell: ({ row }) => {
      return (
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const document = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
