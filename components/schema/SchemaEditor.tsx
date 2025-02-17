import { Puck, type Config, type Field } from '@measured/puck';
import { createClient } from '@supabase/supabase-js';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { TableSchema, SchemaField } from '@/lib/types/schema-component';

const schemaConfig: Config = {
  components: {
    Table: {
      render: ({
        name,
        fields,
        indices,
      }: {
        name: string;
        fields: SchemaField[];
        indices?: { name: string; fields: string[] }[];
      }) => (
        <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              {fields.length} fields
            </span>
          </div>

          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fields</h4>
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 text-sm bg-gray-50 rounded-md"
                  >
                    <span className="font-mono text-blue-600">{field.name}</span>
                    <span className="text-gray-500">{field.type}</span>
                    {field.nullable && <span className="text-xs text-gray-400">nullable</span>}
                    {field.defaultValue != null && (
                      <span className="text-xs text-gray-400">
                        default: {String(field.defaultValue)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {indices && indices.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Indices</h4>
                <div className="space-y-2">
                  {indices.map((index, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 text-sm bg-gray-50 rounded-md"
                    >
                      <span className="font-mono text-purple-600">{index.name}</span>
                      <span className="text-gray-500">({index.fields.join(', ')})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      fields: {
        name: { type: 'text', label: 'Table Name' } as Field,
        fields: {
          type: 'array',
          label: 'Fields',
          arrayFields: {
            name: { type: 'text', label: 'Field Name' } as Field,
            type: {
              type: 'select',
              label: 'Field Type',
              options: [
                { label: 'Text', value: 'string' },
                { label: 'Number', value: 'number' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'Date', value: 'date' },
                { label: 'JSON', value: 'json' },
                { label: 'Array', value: 'array' },
              ],
            } as Field,
            nullable: { type: 'boolean', label: 'Nullable' } as unknown as Field,
            defaultValue: { type: 'text', label: 'Default Value' } as Field,
          },
        } as Field,
      },
    },
    Root: {
      render: ({ children }) => (
        <div className="max-w-5xl mx-auto py-12">
          <div className="space-y-8">{children}</div>
        </div>
      ),
    },
  },
};

interface SchemaEditorProps {
  schema: TableSchema[];
  onChange: (schema: TableSchema[]) => void;
}

export function SchemaEditor({ schema, onChange }: SchemaEditorProps): JSX.Element {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = useCallback(
    async (table: TableSchema) => {
      try {
        // Generate SQL for table creation
        const fieldsSQL = table.fields
          .map((field: SchemaField) => {
            const nullable = field.nullable ? '' : ' NOT NULL';
            const defaultVal = field.defaultValue ? ` DEFAULT ${String(field.defaultValue)}` : '';
            let sql = `${field.name} ${field.type}${nullable}${defaultVal}`;

            if (field.references) {
              sql += ` REFERENCES ${field.references.table}(${field.references.field})`;
              if (field.references.onDelete) {
                sql += ` ON DELETE ${field.references.onDelete}`;
              }
            }

            return sql;
          })
          .join(',\n  ');

        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.${table.name} (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          ${fieldsSQL},
          created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `;

        // Create indices
        const indexSQL =
          table.indices
            ?.map(
              (index: { name: string; fields: string[] }) => `
        CREATE INDEX IF NOT EXISTS ${index.name} ON public.${table.name} (${index.fields.join(', ')});
      `
            )
            .join('\n') || '';

        // Execute schema change
        const { error } = await supabase.rpc('execute_schema_change', {
          change_type: 'create_table',
          table_name: table.name,
          column_name: null,
          sql_statement: createTableSQL + indexSQL,
        });

        if (error) throw error;
        toast.success(`Table ${table.name} created successfully`);
        onChange([...schema, table]);
      } catch (error) {
        console.error('Failed to create table:', error);
        toast.error('Failed to create table. Check console for details.');
      }
    },
    [supabase, schema, onChange]
  );

  return (
    <div className="min-h-[600px] bg-gray-50">
      <Puck
        config={schemaConfig}
        data={{
          root: {
            zones: {
              content: schema.map((table: TableSchema) => ({ type: 'Table', props: table })),
            },
          },
        }}
        onPublish={async (data) => {
          const newTables = data.root.zones.content
            .filter((item: { type: string; props: TableSchema }) => item.type === 'Table')
            .map((item: { type: string; props: TableSchema }) => item.props);

          for (const table of newTables) {
            await handleSave(table);
          }
        }}
      />
    </div>
  );
}
