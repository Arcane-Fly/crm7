'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  CellContext,
  Column,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react';
import * as React from 'react';
import { type ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import styles from './funding-programs-data-table.module.css';

export type FundingProgram = {
  id: string;
  name: string;
  code: string;
  source: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive' | 'Upcoming';
  totalFunding: number;
  claimedFunding: number;
};

const data: FundingProgram[] = [
  {
    id: '1',
    name: 'Australian Apprenticeships Incentives Program',
    code: 'AAIP-2023',
    source: 'Federal',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'Active',
    totalFunding: 1000000,
    claimedFunding: 250000,
  },
  {
    id: '2',
    name: 'NSW Apprenticeship Wage Subsidy',
    code: 'NSW-AWS-2023',
    source: 'State (NSW: unknown)',
    startDate: '2023-03-01',
    endDate: '2024-02-29',
    status: 'Active',
    totalFunding: 500000,
    claimedFunding: 180000,
  },
  {
    id: '3',
    name: 'QLD Apprentice and Trainee Boost',
    code: 'QLD-ATB-2023',
    source: 'State (QLD: unknown)',
    startDate: '2023-07-01',
    endDate: '2024-06-30',
    status: 'Active',
    totalFunding: 750000,
    claimedFunding: 120000,
  },
  {
    id: '4',
    name: 'VIC Jobs and Skills Incentive',
    code: 'VIC-JSI-2023',
    source: 'State (VIC: unknown)',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'Active',
    totalFunding: 600000,
    claimedFunding: 200000,
  },
  {
    id: '5',
    name: 'Rural and Regional Skills Shortage Incentive',
    code: 'RRSSI-2023',
    source: 'Federal',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    status: 'Active',
    totalFunding: 800000,
    claimedFunding: 150000,
  },
];

const getStatusVariant = (status: FundingProgram['status']) => {
  switch (status: unknown) {
    case 'Active':
      return 'secondary';
    case 'Inactive':
      return 'destructive';
    default:
      return 'default';
  }
};

export const columns: ColumnDef<FundingProgram>[] = [
  {
    accessorKey: 'name',
    header: ({ column }: { column: Column<FundingProgram> }): ReactElement => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Program Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }: CellContext<FundingProgram, unknown>): ReactElement => (
      <div className='font-medium'>{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }: CellContext<FundingProgram, unknown>): ReactElement => (
      <div>{row.getValue('code')}</div>
    ),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }: CellContext<FundingProgram, unknown>): ReactElement => (
      <div>{row.getValue('source')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: CellContext<FundingProgram, unknown>): ReactElement => {
      const status = row.getValue('status') as FundingProgram['status'];
      return <Badge variant={getStatusVariant(status: unknown)}>{String(status: unknown)}</Badge>;
    },
  },
  {
    accessorKey: 'totalFunding',
    header: 'Total Funding',
    cell: ({ row }: CellContext<FundingProgram, unknown>): ReactElement => (
      <div>${row.getValue<number>('totalFunding').toLocaleString()}</div>
    ),
  },
  {
    accessorKey: 'claimedFunding',
    header: 'Claimed Funding',
    cell: ({ row }: CellContext<FundingProgram, unknown>): ReactElement => {
      const totalFunding = row.getValue<number>('totalFunding');
      const claimedFunding = row.getValue<number>('claimedFunding');
      const percentage = (claimedFunding / totalFunding) * 100;
      return (
        <div className='flex items-center'>
          <div>${claimedFunding.toLocaleString()}</div>
          <div className='ml-2 h-2 w-16 overflow-hidden rounded-full bg-gray-200'>
            <div
              className={styles.progressBar}
              data-percentage={percentage}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }: CellContext<FundingProgram, unknown>): ReactElement => {
      const program = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-8 w-8 p-0'
            >
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(program.id)}>
              Copy program ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className='mr-2 h-4 w-4' />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className='mr-2 h-4 w-4' />
              Edit program
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className='mr-2 h-4 w-4' />
              View claims
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Trash2 className='mr-2 h-4 w-4' />
              Delete program
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function FundingProgramsDataTable(): ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funding Programs</CardTitle>
        <CardDescription>Manage and view all funding programs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center py-4'>
          <Input
            placeholder='Filter programs...'
            value={table.getColumn('name')?.getFilterValue() as string}
            onChange={(event: unknown) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='ml-auto'
              >
                Columns <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column: unknown) => column.getCanHide())
                .map((column: unknown) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className='capitalize'
                      checked={column.getIsVisible()}
                      onCheckedChange={(value: unknown) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup: unknown) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header: unknown) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row: unknown) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell: unknown) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='flex-1 text-sm text-muted-foreground'>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s: unknown) selected.
          </div>
          <div className='space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
