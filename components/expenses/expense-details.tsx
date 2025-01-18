'use client'

import { type Expense } from '@/lib/services/expense'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface ExpenseDetailsProps {
  expense: Expense
}

export function ExpenseDetails({ expense }: ExpenseDetailsProps) {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Amount</p>
          <p className='text-lg font-semibold'>${expense.amount.toFixed(2)}</p>
        </div>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Status</p>
          <Badge
            variant={
              expense.status === 'approved'
                ? 'success'
                : expense.status === 'rejected'
                  ? 'destructive'
                  : 'default'
            }
          >
            {expense.status}
          </Badge>
        </div>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Category</p>
          <p className='capitalize'>{expense.category}</p>
        </div>
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Submitted</p>
          <p>{formatDate(expense.submitted_at)}</p>
        </div>
      </div>

      <div>
        <p className='text-sm font-medium text-muted-foreground'>Description</p>
        <p className='mt-1'>{expense.description}</p>
      </div>

      {expense.notes && (
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Notes</p>
          <p className='mt-1'>{expense.notes}</p>
        </div>
      )}

      {expense.receipt_url && (
        <div>
          <p className='text-sm font-medium text-muted-foreground'>Receipt</p>
          <Button
            variant='outline'
            className='mt-2'
            onClick={() => window.open(expense.receipt_url, '_blank')}
          >
            View Receipt
            <ExternalLink className='ml-2 h-4 w-4' />
          </Button>
        </div>
      )}

      {expense.approver_id && (
        <div>
          <p className='text-sm font-medium text-muted-foreground'>
            {expense.status === 'approved' ? 'Approved by' : 'Rejected by'}
          </p>
          <p className='mt-1'>{expense.approver_id}</p>
          <p className='text-sm text-muted-foreground'>
            {formatDate(expense.approved_at || expense.rejected_at!)}
          </p>
        </div>
      )}
    </div>
  )
}
