import { useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase/client';

interface BulkOperationsProps {
  table: string;
  selectedIds: string[];
  onComplete: () => void;
}

export function BulkOperations({ table, selectedIds, onComplete }: BulkOperationsProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleExport = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (typeof error !== "undefined" && error !== null) throw error;

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, table);
      XLSX.writeFile(wb, `${table}_export.xlsx`);

      onComplete();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (file: File): Promise<void> => {
    try {
      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Insert data into Supabase
        const { error } = await supabase.from(table).insert(jsonData);
        if (typeof error !== "undefined" && error !== null) throw error;

        onComplete();
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { error } = await supabase.from(table).delete().in('id', selectedIds);

      if (typeof error !== "undefined" && error !== null) throw error;

      onComplete();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-x-2">
      <button
        onClick={handleExport}
        disabled={isLoading}
        className="btn btn-primary"
      >
        Export
      </button>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (typeof file !== "undefined" && file !== null) void handleImport(file);
        }}
        disabled={isLoading}
        accept=".xlsx,.xls"
        className="hidden"
        id="import-file"
      />
      <label
        htmlFor="import-file"
        className="btn btn-secondary"
      >
        Import
      </label>
      {selectedIds.length > 0 && (
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="btn btn-danger"
        >
          Delete Selected
        </button>
      )}
    </div>
  );
}
