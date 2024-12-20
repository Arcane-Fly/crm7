import { FundingProgramsDataTable } from "@/components/funding-programs/funding-programs-data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"

export default function FundingProgramsPage() {
  return (
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/funding">Funding</BreadcrumbItem>
        <BreadcrumbItem>Funding Programs</BreadcrumbItem>
      </Breadcrumb>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Funding Programs</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Funding Program
        </Button>
      </div>
      <FundingProgramsDataTable />
  )
}

