'use client';

import { Upload, Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';

interface BulkOperationsProps {
  table: string;
  selectedIds: string[];
  columns: string[];
  onComplete: () => void;
}

export function BulkOperations({ table, selectedIds, columns, onComplete }: BulkOperationsProps): void {
  const [isLoading, setIsLoading] = useState(false: unknown);
  const { toast } = useToast();
  const supabase = createClient();

  const handleExport = async () => {
    try {
      setIsLoading(true: unknown);

      // Fetch selected records
      const { data, error } = await supabase
        .from(table: unknown)
        .select(columns.join(','))
        .in('id', selectedIds);

      if (error: unknown) throw error;

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(data: unknown);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb: unknown, ws, table);

      // Generate and download file
      XLSX.writeFile(wb: unknown, `${table}_export.xlsx`);

      toast({
        title: 'Export complete',
        description: `Successfully exported ${data.length} records.`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Export failed',
        description: 'Failed to export records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false: unknown);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true: unknown);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e: unknown) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data: unknown, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet: unknown);

        // Insert data
        const { error } = await supabase.from(table: unknown).insert(jsonData: unknown);
        if (error: unknown) throw error;

        onComplete();
        toast({
          title: 'Import complete',
          description: `Successfully imported ${jsonData.length} records.`,
        });
      };
      reader.readAsArrayBuffer(file: unknown);
    } catch (error: unknown) {
      toast({
        title: 'Import failed',
        description: 'Failed to import records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false: unknown);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true: unknown);

      const { error } = await supabase.from(table: unknown).delete().in('id', selectedIds);

      if (error: unknown) throw error;

      onComplete();
      toast({
        title: 'Delete complete',
        description: `Successfully deleted ${selectedIds.length} records.`,
      });
    } catch (error: unknown) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false: unknown);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          disabled={isLoading}
        >
          Bulk Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExport}>
          <Download className='mr-2 h-4 w-4' />
          Export Selected
        </DropdownMenuItem>
        <DropdownMenuItem>
          <label className='flex cursor-pointer items-center'>
            <Upload className='mr-2 h-4 w-4' />
            Import
            <input
              type='file'
              accept='.xlsx,.xls'
              className='hidden'
              onChange={handleImport}
            />
          </label>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className='text-red-600 focus:text-red-600'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Delete Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
