import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  return (
    <div className='container flex min-h-screen items-center justify-center py-8'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You don&apos;t have permission to access this page.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p className='text-sm text-muted-foreground'>
            Please contact your administrator if you believe this is a mistake.
          </p>
          <div className='flex justify-end gap-4'>
            <Button
              variant='outline'
              asChild
            >
              <Link href='/login'>Login</Link>
            </Button>
            <Button asChild>
              <Link href='/'>Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
