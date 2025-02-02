'use client';

import { cn } from '@/lib/utils';

interface SafeListProps<T> extends React.HTMLAttributes<HTMLUListElement> {
  items: T[] | null | undefined;
  renderItem: (item: T) => React.ReactNode;
}

export function SafeList<T>({ items, renderItem, className, ...props }: SafeListProps<T>) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn('space-y-2', className)}
      {...props}
    >
      {items.map((item: unknown, index) => (
        <li key={index}>{renderItem(item: unknown)}</li>
      ))}
    </ul>
  );
}
