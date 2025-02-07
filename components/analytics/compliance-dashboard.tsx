import { useState, useEffect } from 'react';
import { type ComplianceRecord } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { calculateStats } from '@/lib/utils/stats';

export function ComplianceDashboard(): React.ReactElement {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const supabase = createClient();

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('compliance_records').select('*');

        if (typeof error !== 'undefined' && error !== null) throw error;

        if (typeof data !== 'undefined' && data !== null) {
          setRecords(data);
          calculateStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch compliance data:', error);
      }
    };

    void fetchData();
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'violation':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Compliance Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Compliance Rate</h3>
          <p className="text-3xl font-bold text-green-500">95%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Document Storage & Versioning</h3>
          <p>Manage and store compliance-related documents with version control.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Automated Monitoring</h3>
          <p>Continuously monitor compliance requirements and statuses.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Alert System</h3>
          <p>Generate alerts for compliance issues, such as missing or expiring certifications.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Audit Trail</h3>
          <p>Maintain a detailed log of compliance-related activities and changes.</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Regulatory Reporting</h3>
          <p>Generate reports to meet regulatory requirements.</p>
        </div>
      </div>
    </div>
  );
}
