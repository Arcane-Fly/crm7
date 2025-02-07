import { createClient } from '@supabase/ssr';
import { useCallback, useEffect, useState } from 'react';
import { type TableSchema } from '@/lib/types/schema-component';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface DataPreviewProps {
  table: TableSchema;
  limit?: number;
}

export function DataPreview({ table, limit = 5 }: DataPreviewProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [orderBy, setOrderBy] = useState<string>('');
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, { value: string; operator: string }>>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      let query = supabase
        .from(table.name)
        .select('*')
        .limit(limit);

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
              query = query.ilike(field, `%${filter.value}%`);
              break;
          }
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy, { ascending: orderDir === 'asc' });
      }

      const { data: result, error } = await query;

      if (error) throw error;
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast({
        variant: 'destructive',
        title: 'Error fetching data',
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [table.name, limit, orderBy, orderDir, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (field: string, value: string, operator: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: { value, operator },
    }));
  };

  const renderFilterOperator = (field: string) => (
    <Select
      value={filters[field]?.operator || 'eq'}
      onValueChange={(value) => handleFilterChange(field, filters[field]?.value || '', value)}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="eq">Equals</SelectItem>
        <SelectItem value="gt">Greater</SelectItem>
        <SelectItem value="lt">Less</SelectItem>
        <SelectItem value="like">Contains</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {table.name} Preview
        </h3>
        <div className="flex items-center gap-2">
          <Select value={orderBy} onValueChange={setOrderBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Order by..." />
            </SelectTrigger>
            <SelectContent>
              {table.fields.map(field => (
                <SelectItem key={field.name} value={field.name}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {orderBy && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOrderDir(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {orderDir === 'asc' ? '↑' : '↓'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {table.fields.map(field => (
                <TableHead key={field.name}>
                  <div className="space-y-2">
                    <div>{field.name}</div>
                    <div className="flex items-center gap-2">
                      {renderFilterOperator(field.name)}
                      <Input
                        placeholder="Filter..."
                        value={filters[field.name]?.value || ''}
                        onChange={(e) => handleFilterChange(
                          field.name,
                          e.target.value,
                          filters[field.name]?.operator || 'eq'
                        )}
                        className="w-[150px]"
                      />
                    </div>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={table.fields.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={table.fields.length}
                  className="h-24 text-center text-destructive"
                >
                  {error.message}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.fields.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  {table.fields.map(field => (
                    <TableCell key={field.name}>
                      {formatValue(row[field.name], field.type)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatValue(value: any, type: string): string {
  if (value === null) return 'null';
  if (value === undefined) return '';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleString();
    case 'json':
    case 'array':
      return JSON.stringify(value);
    case 'boolean':
      return value ? 'true' : 'false';
    default:
      return String(value);
  }
}
