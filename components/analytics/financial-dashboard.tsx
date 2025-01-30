import { type ReactElement, useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/lib/types/hr';

interface FinancialStats {
  totalTransactions: number;
  totalAmount: number;
  pendingAmount: number;
  completedAmount: number;
  failedAmount: number;
  successRate: number;
}

export function FinancialDashboard(): ReactElement {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    totalTransactions: 0,
    totalAmount: 0,
    pendingAmount: 0,
    completedAmount: 0,
    failedAmount: 0,
    successRate: 0,
  });

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        if (data) {
          const typedTransactions = data as Transaction[];
          setTransactions(typedTransactions);
          calculateStats(typedTransactions);
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        // setLoading(false); // You might need to add a loading state
      }
    };

    void fetchFinancialData();
  }, [supabase]);

  const calculateStats = (transactions: Transaction[]) => {
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const pendingAmount = transactions
      .filter((t) => t.status === 'pending')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const completedAmount = transactions
      .filter((t) => t.status === 'completed')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const failedAmount = transactions
      .filter((t) => t.status === 'failed')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    const successRate =
      totalTransactions > 0
        ? (transactions.filter((t) => t.status === 'completed').length / totalTransactions) * 100
        : 0;

    setStats({
      totalTransactions,
      totalAmount,
      pendingAmount,
      completedAmount,
      failedAmount,
      successRate,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Current financial metrics and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='grid grid-cols-4 gap-4'>
              <div>
                <p className='text-sm font-medium'>Total Transactions</p>
                <p className='text-2xl font-bold'>{stats.totalTransactions}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Total Amount</p>
                <p className='text-2xl font-bold'>{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Completed Amount</p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(stats.completedAmount)}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Pending Amount</p>
                <p className='text-2xl font-bold text-yellow-600'>
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
            </div>

            <div>
              <p className='mb-2 text-sm font-medium'>Transaction Success Rate</p>
              <Progress
                value={stats.successRate}
                className='w-full'
              />
              <p className='mt-1 text-sm text-gray-500'>{stats.successRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {transactions.slice(0, 5).map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <h4 className='font-medium'>{transaction.type}</h4>
                  <p className='text-sm text-gray-500'>Date: {formatDate(transaction.date)}</p>
                </div>
                <div className='flex items-center space-x-4'>
                  <p className='font-medium'>{formatCurrency(transaction.amount)}</p>
                  <Badge className={getStatusColor(transaction.status)}>{transaction.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
