'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Breadcrumb } from '@/components/breadcrumb'

export default function ProgressReviewsPage() {
  const router = useRouter()
  const [data] = useState([])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: 'Progress Reviews', href: '/progress-reviews' }]} />
        <Button onClick={() => router.push('/progress-reviews/new')}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Review
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search progress reviews..."
      />
    </div>
  )
}
