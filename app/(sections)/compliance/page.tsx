import { ActivityList, type Activity } from '@/components/ui/activity-list';
import { Card } from '@/components/ui/card';

const recentAudits: Activity[] = [
  {
    title: 'Annual Safety Audit',
    description: 'Completed with 95% compliance rate',
    date: 'Dec 28, 2023',
  },
  {
    title: 'ISO 9001 Certification Review',
    description: 'In progress - Documentation phase',
    date: 'Jan 2, 2024',
  },
  {
    title: 'Environmental Compliance Check',
    description: 'Scheduled for next week',
    date: 'Jan 10, 2024',
  },
];

const upcomingDeadlines: Activity[] = [
  {
    title: 'OSHA Report Submission',
    description: 'Annual workplace safety report due',
    date: 'Jan 15, 2024',
  },
  {
    title: 'Employee Training Certifications',
    description: '20 certifications expiring',
    date: 'Jan 20, 2024',
  },
  {
    title: 'Policy Updates Review',
    description: 'Quarterly policy review deadline',
    date: 'Jan 31, 2024',
  },
];

export default function CompliancePage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Compliance Dashboard</h1>
        <p className='text-muted-foreground'>
          Monitor compliance status, certifications, and upcoming requirements.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='p-4'>
          <h2 className='text-lg font-semibold'>Overall Compliance</h2>
          <p className='text-2xl font-bold text-green-600'>95%</p>
          <p className='text-sm text-muted-foreground'>+2% from last month</p>
        </Card>
        <Card className='p-4'>
          <h2 className='text-lg font-semibold'>Active Certifications</h2>
          <p className='text-2xl font-bold'>28</p>
          <p className='text-sm text-muted-foreground'>3 pending renewal</p>
        </Card>
        <Card className='p-4'>
          <h2 className='text-lg font-semibold'>Open Audits</h2>
          <p className='text-2xl font-bold'>4</p>
          <p className='text-sm text-muted-foreground'>2 high priority</p>
        </Card>
        <Card className='p-4'>
          <h2 className='text-lg font-semibold'>Policy Updates</h2>
          <p className='text-2xl font-bold'>12</p>
          <p className='text-sm text-muted-foreground'>Pending review</p>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card className='p-4'>
          <h2 className='mb-4 text-xl font-semibold'>Critical Alerts</h2>
          <div className='space-y-4'>
            <div className='flex items-center gap-2 rounded-lg border bg-red-50 p-3 dark:bg-red-950'>
              <div className='h-2 w-2 rounded-full bg-red-500' />
              <div>
                <p className='font-medium text-red-800 dark:text-red-200'>
                  Safety Certification Expiring
                </p>
                <p className='text-sm text-red-600 dark:text-red-300'>
                  5 certifications expire in 7 days
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-950'>
              <div className='h-2 w-2 rounded-full bg-yellow-500' />
              <div>
                <p className='font-medium text-yellow-800 dark:text-yellow-200'>
                  Training Compliance
                </p>
                <p className='text-sm text-yellow-600 dark:text-yellow-300'>
                  15 employees need updated training
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-blue-50 p-3 dark:bg-blue-950'>
              <div className='h-2 w-2 rounded-full bg-blue-500' />
              <div>
                <p className='font-medium text-blue-800 dark:text-blue-200'>
                  Policy Update Required
                </p>
                <p className='text-sm text-blue-600 dark:text-blue-300'>
                  New regulations effective Feb 1
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className='space-y-4'>
          <ActivityList
            title='Recent Audits'
            activities={recentAudits}
          />
          <ActivityList
            title='Upcoming Deadlines'
            activities={upcomingDeadlines}
          />
        </div>
      </div>
    </div>
  );
}
