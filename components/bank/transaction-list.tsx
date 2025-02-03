import { useState } from 'react';
import { type Transaction } from '@/lib/types';
import { DataTable } from '@/components/ui/data-table';
import { Select } from '@/components/ui/select';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps): React.ReactElement {
  const [typeFilter, setTypeFilter] = useState<'credit' | 'debit' | ''>('');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={typeFilter}
          onValueChange={(value: 'credit' | 'debit' | '') => setTypeFilter(value)}
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
