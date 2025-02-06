'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { type Transaction } from '@/lib/types';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import React from 'react';

export function TransactionList(): React.ReactElement {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const supabase = createClient();

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString('en-AU'),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.getValue('description'),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <div className="capitalize">{row.getValue('category')}</div>,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        const type = row.getValue('type') as Transaction['type'];
        const formatted = new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
        }).format(Math.abs(amount));

        return (
          <div className={type === 'credit' ? 'text-green-600' : 'text-red-600'}>
            {type === 'credit' ? '+' : '-'}{formatted}
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('type')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('status')}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(transaction.id)}
              >
                Copy transaction ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit transaction</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  React.useEffect(() => {
    const fetchTransactions = async (): Promise<void> => {
      try {
        const { data, error: fetchError } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (fetchError) throw fetchError;
        setTransactions(data as Transaction[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTransactions();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return <div>Error loading transactions: {error.message}</div>;
  }

  return (
    <div>
      <DataTable
        data={transactions}
        columns={columns}
      />
    </div>
  );
}
