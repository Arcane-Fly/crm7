import { toast } from '@/hooks/use-toast';
import { type ComponentConfig, type Fields, type Field, type DefaultComponentProps } from '@measured/puck';
import { createClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { type SchemaComponentConfig } from '../types/schema-component';

interface CreateSchemaComponentOptions {
  name: string;
  schema: SchemaComponentConfig;
  render: (props: any) => JSX.Element;
}

interface SchemaField {
  type: string;
  label: string;
  dbField?: string;
  validation?: Record<string, unknown>;
}

export function createSchemaComponent({
  name,
  schema,
  render,
}: CreateSchemaComponentOptions): ComponentConfig<DefaultComponentProps> {
  const Component = (props: any) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
      if (!schema.dbTable) return;

      try {
        setLoading(true);
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        let query = supabase
          .from(schema.dbTable)
          .select('*');

        Object.entries(props).forEach(([key, value]) => {
          const field = schema.fields[key] as SchemaField;
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
      void fetchData();
    }, [fetchData]);

    return render({ ...props, data, loading, error });
  };

  const fields: Fields<DefaultComponentProps> = {};
  Object.entries(schema.fields).forEach(([key, field]) => {
    fields[key] = {
      type: field.type,
      label: field.label,
      defaultValue: field.defaultValue,
    } as Field<any>;
  });

  return {
    render: Component,
    fields,
  };
}
