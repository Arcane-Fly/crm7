import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Performance Monitoring',
};

export default function MonitoringPage() {
  return (
    <div className='container mx-auto py-6'>
      <Card className='p-6'>
        <h1 className='mb-6 text-3xl font-bold'>Performance Monitoring</h1>
        <PerformanceDashboard />
      </Card>
    </div>
  );
}
