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

export function BulkOperations({ table, selectedIds, columns, onComplete }: BulkOperationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleExport = async () => {
    try {
      setIsLoading(true);

      // Fetch selected records
      const { data, error } = await supabase
        .from(table)
        .select(columns.join(','))
        .in('id', selectedIds);

      if (error) throw error;

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, table);

      // Generate and download file
      XLSX.writeFile(wb, `${table}_export.xlsx`);

      toast({
        title: 'Export complete',
        description: `Successfully exported ${data.length} records.`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Insert data
        const { error } = await supabase.from(table).insert(jsonData);
        if (error) throw error;

        onComplete();
        toast({
          title: 'Import complete',
          description: `Successfully imported ${jsonData.length} records.`,
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase.from(table).delete().in('id', selectedIds);

      if (error) throw error;

      onComplete();
      toast({
        title: 'Delete complete',
        description: `Successfully deleted ${selectedIds.length} records.`,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete records. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
