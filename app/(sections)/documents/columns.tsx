import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export type Document = {
  id: string
  name: string
  type: string
  size: number
  created_at: string
  updated_at: string
  status: string
}

export const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    accessorKey: 'size',
    header: 'Size',
    cell: ({ getValue }) => {
      const size = getValue() as number
      return formatFileSize(size)
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    header: 'Last Updated',
    accessorKey: 'updated_at',
    cell: ({ getValue }: any) => new Date(getValue()).toLocaleDateString(),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      return (
        <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(status)}`}>{status}</span>
      )
    },
  },
  {
    id: 'actions',
    cell: () => {
      return (
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm'>
            View
          </Button>
          <Button variant='ghost' size='sm'>
            Download
          </Button>
        </div>
      )
    },
  },
]

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'archived':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
