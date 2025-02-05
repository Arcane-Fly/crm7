import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';
import { type Transaction } from '@/lib/types';
import { useState } from 'react';

interface TransactionListProps {
}

export function TransactionList(): React.ReactElement {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [typeFilter, setTypeFilter] = useState<'credit' | 'debit' | ''>('');

  const _formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={typeFilter}
          onValueChange={(value: 'credit' | 'debit' | ''): void => setTypeFilter(value)}
        >
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </Select>
      </div>

      <DataTable
        data={transactions}
        columns={[]}
        enableSorting
        enableFiltering
        enableColumnVisibility
      />
    </div>
  );
}
