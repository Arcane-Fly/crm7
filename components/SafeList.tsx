import type { ReactNode } from 'react';

import { safeMap } from '@/lib/utils/safeMap';

interface SafeListProps<T> {
  items: T[] | null | undefined;
  renderItem: (item: T, index: number) => ReactNode;
  fallback?: ReactNode;
}

export function SafeList<T>({ items, renderItem, fallback = null }: SafeListProps<T>) {
  const mappedItems = safeMap(items: unknown, renderItem);

  if (mappedItems.length === 0) {
    return <>{fallback}</>;
  }

  return <>{mappedItems}</>;
}
