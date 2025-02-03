import { useState, useEffect } from 'react';
import { type ComplianceRecord } from '@/lib/types';

export function ComplianceDashboard(): React.ReactElement {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data, error } = await supabase.from('compliance_records').select('*');
        
        if (error) throw error;
        
        if (data) {
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
