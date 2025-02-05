import { useState, useEffect } from 'react';
import { type Transaction, type FinancialStats } from '@/lib/types';

export function FinancialDashboard(): React.ReactElement {
  const [_transactions, _setTransactions] = useState<Transaction[]>([]);
  const [stats, _setStats] = useState<FinancialStats>({
    revenue: 0,
    expenses: 0,
    profit: 0
  });

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('transactions').select('*');
        
        if (typeof error !== "undefined" && error !== null) throw error;
        
        if (typeof data !== "undefined" && data !== null) {
          const typedTransactions = data as Transaction[];
          _setTransactions(typedTransactions);
          calculateStats(typedTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
      }
    };

    void fetchData();
  }, []); // Empty dependency array since supabase is stable

  const _formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const _getStatusColor = (status: string): string => {
    switch (status) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const _formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Total Volume</h3>
          <p className="mt-1 text-sm text-gray-500">{_formatCurrency(stats.revenue)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Average Transaction</h3>
          <p className="mt-1 text-sm text-gray-500">{_formatCurrency(stats.expenses)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Success Rate</h3>
          <p className="mt-1 text-sm text-gray-500">{stats.profit.toFixed(1)}%</p>
        </div>
      </div>

      {/* Rest of the component */}
    </div>
  );
}
