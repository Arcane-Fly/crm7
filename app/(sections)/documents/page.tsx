'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default function DocumentsPage() {
  const router = useRouter()
  const [data] = useState([])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Breadcrumb items={[{ label: 'Documents', href: '/documents' }]} />
        <Button onClick={() => router.push('/documents/upload')}>
          <Upload className='mr-2 h-4 w-4' /> Upload Document
        </Button>
      </div>
      <DataTable columns={columns} data={data} searchPlaceholder='Search documents...' />
    </div>
  )
}
