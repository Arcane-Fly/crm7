import { ReactNode } from 'react';
import { safeMap } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface SafeListProps<T> {
  items: T[] | null | undefined;
  renderItem: (item: T, index: number) => ReactNode;
  fallback?: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
}

export function SafeList<T>({ 
  items, 
  renderItem, 
  fallback = null,
  isLoading = false,
  error = null
}: SafeListProps<T>) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message}
      </div>
    );
  }
  
  const mappedItems = safeMap(items, renderItem);
  
  if (mappedItems.length === 0) {
    return <>{fallback}</>;
  }
  
  return <>{mappedItems}</>;
}