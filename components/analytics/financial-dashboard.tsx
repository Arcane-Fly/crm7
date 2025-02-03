import { useState, useEffect } from 'react';
import { type Transaction, type FinancialStats } from '@/lib/types';

export function FinancialDashboard(): React.ReactElement {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalAmount: 0,
    successRate: 0,
    averageAmount: 0
  });

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('transactions').select('*');
        
        if (error) throw error;
        
        if (data) {
          const typedTransactions = data as Transaction[];
          setTransactions(typedTransactions);
          calculateStats(typedTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
      }
    };

    void fetchData();
  }, []); // Empty dependency array since supabase is stable

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Total Volume</h3>
          <p className="mt-1 text-sm text-gray-500">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Average Transaction</h3>
          <p className="mt-1 text-sm text-gray-500">{formatCurrency(stats.averageAmount)}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Success Rate</h3>
          <p className="mt-1 text-sm text-gray-500">{stats.successRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Rest of the component */}
    </div>
  );
}
