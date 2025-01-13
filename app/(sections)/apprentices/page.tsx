'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Breadcrumb } from '@/components/breadcrumb'
import { DataEnrichment } from '@/components/admin/data-enrichment'
import { useAdminAccess } from '@/lib/hooks/useAdminAccess'

export default function ApprenticesPage() {
  const router = useRouter()
  const { isAdmin } = useAdminAccess()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [data] = useState([])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: 'Apprentices', href: '/apprentices' }]} />
        <div className="flex items-center space-x-2">
          {isAdmin && selectedIds.length === 1 && (
            <DataEnrichment
              type="apprentice"
              id={selectedIds[0]}
              onComplete={() => {
                // Refresh data
              }}
            />
          )}
          <Button onClick={() => router.push('/apprentices/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Apprentice
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search apprentices..."
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  )
}
