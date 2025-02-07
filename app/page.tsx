import { redirect } from 'next/navigation';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

export default function Home(): JSX.Element {
  return (
    <ErrorBoundary>
      {redirect('/dashboard')}
    </ErrorBoundary>
  );
}
