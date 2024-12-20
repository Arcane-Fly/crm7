import { ApprenticesDataTable } from "@/components/apprentices/apprentices-data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"

export default function ApprenticesPage() {
  return (
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Apprentices</BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Apprentices</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Apprentice
        </Button>
      </div>
      <ApprenticesDataTable />
  )
}

