import { type ReactElement, useState, useEffect } from 'react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/types/database';
import type { ComplianceRecord } from '@/lib/types/hr';

interface ComplianceStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  pending: number;
  complianceRate: number;
}

export function ComplianceDashboard(): ReactElement {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    pending: 0,
    complianceRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from<
            'compliance_records',
            Database['public']['Tables']['compliance_records']['Row']
          >('compliance_records')
          .select('*')
          .order('dueDate', { ascending: false });

        if (error) throw error;

        if (data) {
          setRecords(data);
          calculateStats(data);
        }
      } catch (error) {
        console.error('Error fetching compliance data:', error);
      } finally {
        // setLoading(false); // This line was not present in the original code, so I'm commenting it out
      }
    };

    void fetchData();
  }, []);

  const calculateStats = (records: ComplianceRecord[]) => {
    const total = records.length;
    const compliant = records.filter((r) => r.status === 'compliant').length;
    const nonCompliant = records.filter((r) => r.status === 'non_compliant').length;
    const pending = records.filter((r) => r.status === 'pending').length;
    const complianceRate = total > 0 ? (compliant / total) * 100 : 0;

    setStats({
      total,
      compliant,
      nonCompliant,
      pending,
      complianceRate,
    });
  };

  const getStatusColor = (status: ComplianceRecord['status']) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500';
      case 'non_compliant':
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
          <CardTitle>Compliance Overview</CardTitle>
          <CardDescription>Current compliance status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='grid grid-cols-4 gap-4'>
              <div>
                <p className='text-sm font-medium'>Total Records</p>
                <p className='text-2xl font-bold'>{stats.total}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Compliant</p>
                <p className='text-2xl font-bold text-green-600'>{stats.compliant}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Non-Compliant</p>
                <p className='text-2xl font-bold text-red-600'>{stats.nonCompliant}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Pending</p>
                <p className='text-2xl font-bold text-yellow-600'>{stats.pending}</p>
              </div>
            </div>

            <div>
              <p className='mb-2 text-sm font-medium'>Overall Compliance Rate</p>
              <Progress
                value={stats.complianceRate}
                className='w-full'
              />
              <p className='mt-1 text-sm text-gray-500'>{stats.complianceRate.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Compliance Records</CardTitle>
          <CardDescription>Latest compliance status updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {records.slice(0, 5).map((record: ComplianceRecord) => (
              <div
                key={record.id}
                className='flex items-center justify-between rounded-lg border p-4'
              >
                <div>
                  <h4 className='font-medium'>{record.type}</h4>
                  <p className='text-sm text-gray-500'>Due: {formatDate(record.dueDate)}</p>
                </div>
                <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
