import { useState, useEffect } from 'react';
import { type ComplianceRecord } from '@/lib/types';

export function ComplianceDashboard(): JSX.Element {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('compliance_records').select('*');
        
        if (typeof error !== "undefined" && error !== null) throw error;
        
        if (typeof data !== "undefined" && data !== null) {
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
        return 'text-green-500';
      case 'non_compliant':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Rest of component implementation...
}
