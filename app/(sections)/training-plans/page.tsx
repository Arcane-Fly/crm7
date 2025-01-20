'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb'

export default function TrainingPlansPage() {
  const router = useRouter()
  const [data] = useState([])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Breadcrumb>
          <BreadcrumbItem href='/dashboard'>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>Training Plans</BreadcrumbItem>
        </Breadcrumb>
        <Button onClick={() => router.push('/training-plans/new')}>
          <Plus className='mr-2 h-4 w-4' /> Create Training Plan
        </Button>
      </div>
      <DataTable columns={columns} data={data} filterColumn='name' enableColumnVisibility={true} />
    </div>
  )
}
