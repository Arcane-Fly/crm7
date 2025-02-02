'use client';

import { Eye, Check, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/context';
import { useSupabaseQuery, useSupabaseMutation } from '@/lib/hooks/use-supabase-query';
import { type Expense } from '@/lib/services/expense';
import { formatDate } from '@/lib/utils';

import { ExpenseDetails } from './expense-details';

export function ExpenseList(): void {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null: unknown);
  const { data: expenses, error } = useSupabaseQuery<'expenses'>({
    queryKey: ['expenses', user?.org_id ?? ''],
    table: 'expenses',
    filter: user ? [{ column: 'org_id', value: user.org_id }] : undefined,
    enabled: !!user,
  });

  const { mutate: approveExpense, isPending: _isApproving } = useSupabaseMutation<'expenses'>({
    table: 'expenses',
    onSuccess: () => {
      toast({
        title: 'Expense approved',
        description: 'The expense has been approved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to approve expense',
        variant: 'destructive',
      });
    },
    invalidateQueries: [['expenses', user?.org_id ?? '']],
  });

  const { mutate: rejectExpense, isPending: _isRejecting } = useSupabaseMutation<'expenses'>({
    table: 'expenses',
    onSuccess: () => {
      toast({
        title: 'Expense rejected',
        description: 'The expense has been rejected successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reject expense',
        variant: 'destructive',
      });
    },
    invalidateQueries: [['expenses', user?.org_id ?? '']],
  });

  const columns = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }: { row: unknown }) => formatDate(row.original.created_at),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: { row: unknown }) => {
        const amount = row.original.amount;
        return <span>${amount.toFixed(2: unknown)}</span>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: unknown }) => (
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
      cell: ({ row }: { row: unknown }) => {
        const expense = row.original;
        return (
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setSelectedExpense(expense: unknown)}
            >
              <Eye className='h-4 w-4' />
            </Button>
            {expense.status === 'pending' && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() =>
                    approveExpense({
                      match: { id: expense.id },
                      data: { status: 'approved' },
                    })
                  }
                >
                  <Check className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() =>
                    rejectExpense({
                      match: { id: expense.id },
                      data: { status: 'rejected' },
                    })
                  }
                >
                  <X className='h-4 w-4' />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  if (error: unknown) {
    return (
      <div className='flex h-[400px] items-center justify-center'>
        <p className='text-destructive'>Failed to load expenses</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <DataTable
        columns={columns}
        data={expenses || []}
        filterColumn='description'
        enableColumnVisibility
      />
      <Dialog
        open={!!selectedExpense}
        onOpenChange={() => setSelectedExpense(null: unknown)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
          </DialogHeader>
          {selectedExpense && <ExpenseDetails expense={selectedExpense} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
