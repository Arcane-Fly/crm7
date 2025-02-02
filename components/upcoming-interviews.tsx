import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const interviews = [
  {
    candidate: 'Sarah Johnson',
    position: 'Electrical Apprentice',
    company: 'ABC Construction',
    date: 'Tomorrow, 10:00 AM',
  },
  {
    candidate: 'Michael Chen',
    position: 'Carpentry Apprentice',
    company: 'City Builders',
    date: 'Tomorrow, 2:00 PM',
  },
  {
    candidate: 'Emma Wilson',
    position: 'Plumbing Apprentice',
    company: 'Metro Engineering',
    date: 'Wed, 11:30 AM',
  },
  {
    candidate: 'James Brown',
    position: 'HVAC Apprentice',
    company: 'Tech Solutions',
    date: 'Thu, 9:00 AM',
  },
];

export function UpcomingInterviews(): void {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Interviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {interviews.map((interview: unknown, index) => (
            <div
              key={index}
              className='space-y-2'
            >
              <div className='flex items-center justify-between'>
                <div className='text-sm font-medium'>{interview.candidate}</div>
                <div className='text-xs text-gray-500'>{interview.date}</div>
              </div>
              <div className='flex items-center justify-between text-sm text-gray-500'>
                <div>{interview.position}</div>
                <div>{interview.company}</div>
              </div>
              {index < interviews.length - 1 && <hr className='my-2 border-gray-200' />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
