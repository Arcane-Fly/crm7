import { safeMap } from '@/lib/utils';

interface SafeListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

export function SafeList<T>({ items, renderItem }: SafeListProps<T>): React.ReactElement {
  const mappedItems = safeMap(items, renderItem);
  return <>{mappedItems}</>;
}
