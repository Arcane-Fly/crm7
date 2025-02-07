import { Puck, type Config } from '@measured/puck';
import { createClient } from '@supabase/supabase-js';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

interface SchemaField {
  name: string;
  type: string;
  nullable?: boolean;
  defaultValue?: string;
  references?: {
    table: string;
    field: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

interface TableConfig {
  name: string;
  fields: SchemaField[];
  indices?: { name: string; fields: string[] }[];
  constraints?: {
    name: string;
    type: 'UNIQUE' | 'CHECK' | 'FOREIGN KEY';
    definition: string;
  }[];
}

const schemaConfig: Config = {
  components: {
    Table: {
      render: ({ name, fields, indices }) => (
        <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
              {fields.length} fields
            </span>
          </div>

          <div className="space-y-4">
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
                    {!field.nullable && (
                      <span className="px-1.5 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded">
                        required
                      </span>
                    )}
                    {field.defaultValue && (
                      <span className="text-gray-400">= {field.defaultValue}</span>
                    )}
                    {field.references && (
                      <div className="flex items-center gap-1 px-2 py-1 text-xs text-blue-700 bg-blue-50 rounded-full">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        <span>
                          {field.references.table}.{field.references.field}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {indices && indices.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Indices</h4>
                <div className="space-y-1">
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
        name: { type: 'text', label: 'Table Name' },
        fields: {
          type: 'array',
          label: 'Fields',
          arrayFields: {
            name: { type: 'text', label: 'Field Name' },
            type: {
              type: 'select',
              label: 'Data Type',
              options: [
                { label: 'Text', value: 'text' },
                { label: 'Integer', value: 'integer' },
                { label: 'Boolean', value: 'boolean' },
                { label: 'UUID', value: 'uuid' },
                { label: 'Timestamp', value: 'timestamptz' },
                { label: 'JSON', value: 'jsonb' },
                { label: 'Float', value: 'float8' },
                { label: 'Serial', value: 'serial' }
              ]
            },
            nullable: { type: 'boolean', label: 'Nullable' },
            defaultValue: { type: 'text', label: 'Default Value' },
            references: {
              type: 'object',
              label: 'Foreign Key',
              objectFields: {
                table: { type: 'text', label: 'Referenced Table' },
                field: { type: 'text', label: 'Referenced Field' },
                onDelete: {
                  type: 'select',
                  label: 'On Delete',
                  options: [
                    { label: 'CASCADE', value: 'CASCADE' },
                    { label: 'SET NULL', value: 'SET NULL' },
                    { label: 'RESTRICT', value: 'RESTRICT' }
                  ]
                }
              }
            }
          }
        },
        indices: {
          type: 'array',
          label: 'Indices',
          arrayFields: {
            name: { type: 'text', label: 'Index Name' },
            fields: { type: 'array', label: 'Fields', arrayFields: { type: 'text' } }
          }
        }
      },
      defaultProps: {
        name: '',
        fields: [],
        indices: []
      }
    }
  },
  root: {
    render: ({ children }) => (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      </div>
    )
  }
};

export function SchemaEditor() {
  const [tables, setTables] = useState<TableConfig[]>([]);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = useCallback(async (table: TableConfig) => {
    try {
      // Generate SQL for table creation
      const fieldsSQL = table.fields
        .map(field => {
          const nullable = field.nullable ? '' : ' NOT NULL';
          const defaultVal = field.defaultValue ? ` DEFAULT ${field.defaultValue}` : '';
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
      const indexSQL = table.indices?.map(index => `
        CREATE INDEX IF NOT EXISTS ${index.name} ON public.${table.name} (${index.fields.join(', ')});
      `).join('\n') || '';

      // Execute schema change
      const { error } = await supabase.rpc('execute_schema_change', {
        change_type: 'create_table',
        table_name: table.name,
        column_name: null,
        sql_statement: createTableSQL + indexSQL
      });

      if (error) throw error;
      toast.success(`Table ${table.name} created successfully`);
      setTables([...tables, table]);
    } catch (error) {
      console.error('Failed to create table:', error);
      toast.error('Failed to create table. Check console for details.');
    }
  }, [supabase, tables]);

  return (
    <div className="min-h-[600px] bg-gray-50">
      <Puck
        config={schemaConfig}
        data={{ root: { zones: { content: [] } } }}
        onPublish={async (data) => {
          const newTables = data.root.zones.content
            .filter((item: any) => item.type === 'Table')
            .map((item: any) => item.props as TableConfig);

          for (const table of newTables) {
            await handleSave(table);
          }
        }}
      />
    </div>
  );
}
