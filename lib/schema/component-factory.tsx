import { type ComponentConfig } from '@measured/puck';
import { type SchemaComponentConfig, type SchemaField } from '../types/schema-component';
import { createClient } from '@supabase/ssr';
import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface CreateSchemaComponentOptions {
  name: string;
  schema: SchemaComponentConfig;
  render: (props: any) => JSX.Element;
}

export function createSchemaComponent({
  name,
  schema,
  render,
}: CreateSchemaComponentOptions): ComponentConfig {
  const Component = (props: any) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
      if (!schema.dbTable) return;

      try {
        setLoading(true);
        const supabase = createClient();
        
        // Build query based on schema
        let query = supabase
          .from(schema.dbTable)
          .select(Object.entries(schema.fields)
            .filter(([_, field]) => field.dbField)
            .map(([_, field]) => field.dbField!)
            .join(',')
          );

        // Apply filters from props
        Object.entries(props).forEach(([key, value]) => {
          const field = schema.fields[key];
          if (field?.dbField) {
            query = query.eq(field.dbField, value);
          }
        });

        const { data: result, error } = await query;

        if (error) throw error;
        setData(result);
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
    }, [props]);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    // Validate props against schema
    useEffect(() => {
      if (!schema.validation?.rules) return;

      Object.entries(props).forEach(([key, value]) => {
        const field = schema.fields[key];
        if (field?.validation) {
          Object.entries(field.validation).forEach(([rule, config]) => {
            if (typeof config === 'function') {
              const isValid = config(value);
              if (!isValid) {
                const message = schema.validation?.messages?.[`${key}.${rule}`] 
                  || `Invalid value for ${key}`;
                toast({
                  variant: 'destructive',
                  title: 'Validation Error',
                  description: message,
                });
              }
            }
          });
        }
      });
    }, [props]);

    if (error) {
      return (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <h3 className="font-semibold">Error Loading Component</h3>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-md" />
        </div>
      );
    }

    return render({ ...props, data });
  };

  return {
    component: Component,
    props: Object.fromEntries(
      Object.entries(schema.fields).map(([key, field]) => [
        key,
        {
          type: field.type,
          label: field.label,
          defaultValue: field.defaultValue,
        },
      ])
    ),
    preview: schema.preview && {
      fields: schema.preview.fields,
      template: schema.preview.template,
    },
  };
}
