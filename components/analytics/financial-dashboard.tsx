'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Transaction, FinancialStats } from '@/lib/types';

export function FinancialDashboard(): React.ReactElement {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    revenue: 0,
    expenses: 0,
    profit: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('transactions').select('*');
        
        if (error) throw error;
        
        setTransactions(data as Transaction[]);
        calculateStats(data as Transaction[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [supabase]);

  if (isLoading) {
    return <div>Loading financial data...</div>;
  }

  if (error) {
    return <div>Error loading financial data: {error.message}</div>;
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const calculateStats = (transactions: Transaction[]): void => {
    const revenue = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const profit = revenue - expenses;
    setStats({ revenue, expenses, profit });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Revenue</h3>
          <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Expenses</h3>
          <p className="text-2xl font-bold">{formatCurrency(stats.expenses)}</p>
        </div>
        <div className="p-4 bg-card rounded-lg shadow">
          <h3 className="text-lg font-medium">Profit</h3>
          <p className="text-2xl font-bold">{formatCurrency(stats.profit)}</p>
        </div>
      </div>
      
      <div className="bg-card rounded-lg shadow">
        <h3 className="p-4 text-lg font-medium border-b">Recent Transactions</h3>
        <div className="divide-y">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
              </div>
              <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
