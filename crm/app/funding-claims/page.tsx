import { FundingClaimsDataTable } from "@/components/funding-claims/funding-claims-data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'

export default function FundingClaimsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Funding Claims</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Claim
        </Button>
      </div>
      <FundingClaimsDataTable />
    </div>
  )
}

