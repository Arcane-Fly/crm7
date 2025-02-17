import { type Config, type ComponentConfig as PuckComponentConfig, type Field } from '@measured/puck';

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'json'
  | 'array'
  | 'relation'
  | 'text'
  | 'textarea'
  | 'radio'
  | 'select';

export interface SchemaField {
  name: string;
  type: FieldType;
  label: string;
  defaultValue?: unknown;
  nullable?: boolean;
  options?: Array<{ label: string; value: unknown }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean;
    rules?: Record<string, (value: unknown) => boolean>;
  };
  references?: {
    table: string;
    field: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

export interface TableSchema {
  name: string;
  fields: SchemaField[];
  indices?: Array<{
    name: string;
    fields: string[];
    unique?: boolean;
  }>;
  constraints?: Array<{
    name: string;
    type: 'UNIQUE' | 'CHECK' | 'FOREIGN KEY';
    definition: string;
  }>;
}

export interface ComponentField {
  type: FieldType;
  label: string;
  dbField?: string;
  defaultValue?: unknown;
  validation?: Record<string, unknown>;
  preview?: boolean;
}

export interface SchemaComponentConfig {
  dbTable?: string;
  fields: Record<string, SchemaField>;
  preview?: {
    fields: string[];
    template?: string;
  };
  validation?: {
    rules?: Record<string, (value: unknown) => boolean>;
    messages?: Record<string, string>;
  };
}

export interface SchemaAwarePuckConfig extends Omit<Config, 'components'> {
  components: Record<string, PuckComponentConfig & {
    schema?: SchemaComponentConfig;
  }>;
}
