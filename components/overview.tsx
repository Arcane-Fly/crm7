import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Overview(): void {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Active Apprentices</p>
              <p className='text-2xl font-bold'>245</p>
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Host Employers</p>
              <p className='text-2xl font-bold'>182</p>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Completion Rate</p>
              <p className='text-2xl font-bold'>89%</p>
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-muted-foreground'>Active Placements</p>
              <p className='text-2xl font-bold'>203</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
