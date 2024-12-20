import { QualificationsDataTable } from "@/components/qualifications/qualifications-data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'

export default function QualificationsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Qualifications</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Qualification
        </Button>
      </div>
      <QualificationsDataTable />
    </div>
  )
}

