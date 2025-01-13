'use client'

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Breadcrumb } from '@/components/breadcrumb'

export default function HostEmployersPage() {
  const router = useRouter()
  const [data] = useState([])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb items={[{ label: 'Host Employers', href: '/host-employers' }]} />
        <Button onClick={() => router.push('/host-employers/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Host Employer
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search host employers..."
      />
    </div>
  )
}
