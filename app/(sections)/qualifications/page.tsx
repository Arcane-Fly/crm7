'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem } from '@/components/breadcrumb'
import { DataEnrichment } from '@/components/admin/data-enrichment'
import { useAdminAccess } from '@/lib/hooks/useAdminAccess'

export default function QualificationsPage() {
  const router = useRouter()
  const { isAdmin } = useAdminAccess()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [data] = useState([])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Breadcrumb>
          <BreadcrumbItem href='/dashboard'>Dashboard</BreadcrumbItem>
          <BreadcrumbItem>Qualifications</BreadcrumbItem>
        </Breadcrumb>
        <div className='flex items-center space-x-2'>
          {isAdmin && selectedIds.length === 1 && (
            <DataEnrichment
              type='qualification'
              id={selectedIds[0]}
              onComplete={() => {
                // Refresh data
              }}
            />
          )}
          <Button onClick={() => router.push('/qualifications/new')}>
            <Plus className='mr-2 h-4 w-4' /> Add Qualification
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        filterColumn='name'
        enableRowSelection={true}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  )
}
