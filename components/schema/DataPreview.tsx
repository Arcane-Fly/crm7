import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { type TableSchema } from '@/lib/types/schema-component';
import { useCallback, useEffect, useState } from 'react';

interface DataPreviewProps {
  schema: TableSchema[];
  limit?: number;
}

interface TableData {
  [key: string]: unknown;
}

export function DataPreview({ schema, limit = 5 }: DataPreviewProps) {
  const [selectedTable, setSelectedTable] = useState<TableSchema | null>(schema[0] || null);
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [orderBy, setOrderBy] = useState<string>('');
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, { value: string; operator: string }>>({});

  const fetchData = useCallback(async () => {
    if (!selectedTable) return;

    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase.from(selectedTable.name).select('*').limit(limit);

      // Apply filters
      Object.entries(filters).forEach(([field, filter]) => {
        if (filter.value) {
          switch (filter.operator) {
            case 'eq':
              query = query.eq(field, filter.value);
              break;
            case 'gt':
              query = query.gt(field, filter.value);
              break;
            case 'lt':
              query = query.lt(field, filter.value);
              break;
            case 'like':
              query = query.like(field, `%${filter.value}%`);
              break;
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderDir === 'asc' });
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;
      setData(result || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err as Error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTable, limit, filters, orderBy, orderDir]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!selectedTable) {
    return (
      <div className="text-center py-12 text-muted-foreground">No tables available for preview</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          value={selectedTable.name}
          onValueChange={(value) => {
            const table = schema.find((t) => t.name === value);
            if (table) {
              setSelectedTable(table);
              setFilters({});
              setOrderBy('');
              setOrderDir('asc');
            }
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select table" />
          </SelectTrigger>
          <SelectContent>
            {schema.map((table) => (
              <SelectItem key={table.name} value={table.name}>
                {table.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={orderBy} onValueChange={setOrderBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Order by" />
          </SelectTrigger>
          <SelectContent>
            {selectedTable.fields.map((field) => (
              <SelectItem key={field.name} value={field.name}>
                {field.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {orderBy && (
          <Select value={orderDir} onValueChange={(value) => setOrderDir(value as 'asc' | 'desc')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button onClick={() => fetchData()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {selectedTable.fields.map((field) => (
          <div key={field.name} className="flex items-center gap-2">
            <Input
              placeholder={`Filter ${field.name}`}
              value={filters[field.name]?.value || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  [field.name]: { ...prev[field.name], value: e.target.value },
                }))
              }
              className="w-[200px]"
            />
            <Select
              value={filters[field.name]?.operator || 'eq'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  [field.name]: { ...prev[field.name], operator: value },
                }))
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eq">=</SelectItem>
                <SelectItem value="gt">&gt;</SelectItem>
                <SelectItem value="lt">&lt;</SelectItem>
                <SelectItem value="like">Contains</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error.message}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No data available</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {selectedTable.fields.map((field) => (
                  <TableHead key={field.name}>{field.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i}>
                  {selectedTable.fields.map((field) => (
                    <TableCell key={field.name}>
                      {formatValue(row[field.name], field.type)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function formatValue(value: unknown, type: string): string {
  if (value === null) return 'null';
  if (value === undefined) return '';

  switch (type) {
    case 'date':
      return new Date(value as string).toLocaleString();
    case 'json':
    case 'array':
      return JSON.stringify(value);
    case 'boolean':
      return (value as boolean) ? 'true' : 'false';
    default:
      return String(value);
  }
}
