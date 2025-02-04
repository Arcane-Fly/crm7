import type { ColumnDef } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  filterColumn: string;
  enableColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  onSelectedIdsChange?: Dispatch<SetStateAction<string[]>>;
}

export function DataTable<TData>({
  columns,
  data,
  filterColumn,
  enableColumnVisibility = false,
  enableRowSelection = false,
  onSelectedIdsChange,
}: DataTableProps<TData>): JSX.Element {
  // ... implementation
  return (
    <div>
      {/* Your existing DataTable implementation */}
    </div>
  );
}
