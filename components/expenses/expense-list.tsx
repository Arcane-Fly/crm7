'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth/context'
import { expenseService, type Expense } from '@/lib/services/expense'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { Eye, Check, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExpenseDetails } from './expense-details'

export function ExpenseList() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null)
  const { data: expenses, error, isLoading } = useSupabaseQuery<Expense>({
    queryKey: ['expenses', user?.org_id],
    table: 'expenses',
    filter: user ? [{ column: 'org_id', value: user.org_id }] : undefined,
    enabled: !!user,
  })

  const { mutate: approveExpense, isLoading: isApproving } = useSupabaseMutation<Expense>({
    table: 'expenses',
    type: 'update',
    onSuccess: () => {
      toast({
        title: 'Expense approved',
        description: 'The expense has been approved successfully.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to approve expense',
        variant: 'destructive',
      })
    },
    invalidateQueries: [['expenses', user?.org_id]],
  })

  const { mutate: rejectExpense, isLoading: isRejecting } = useSupabaseMutation<Expense>({
    table: 'expenses',
    type: 'update',
    onSuccess: () => {
      toast({
        title: 'Expense rejected',
        description: 'The expense has been rejected.',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reject expense',
        variant: 'destructive',
      })
    },
    invalidateQueries: [['expenses', user?.org_id]],
  })

  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch expenses',
        variant: 'destructive',
      })
    }
  }, [error, toast])

  const handleApprove = (expense: Expense) => {
    if (!user) return
    approveExpense({
      id: expense.id,
      data: {
        status: 'approved',
        approved_at: new Date().toISOString(),
        approver_id: user.id,
      },
    })
  }

  const handleReject = (expense: Expense) => {
    if (!user) return
    rejectExpense({
      id: expense.id,
      data: {
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        approver_id: user.id,
        notes: 'Rejected by approver',
      },
    })
  }

  const columns = [
    {
      accessorKey: 'submitted_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.original.submitted_at),
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.category}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'approved'
              ? 'success'
              : row.original.status === 'rejected'
              ? 'destructive'
              : 'default'
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedExpense(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 'submitted' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleApprove(row.original)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleReject(row.original)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={expenses}
        loading={isLoading}
      />
      <Dialog
        open={!!selectedExpense}
        onOpenChange={(open) => !open && setSelectedExpense(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <ExpenseDetails expense={selectedExpense} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
