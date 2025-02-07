import { type Config as PuckConfig } from '@measured/puck';

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'json'
  | 'array'
  | 'relation';

export interface SchemaField {
  name: string;
  type: FieldType;
  nullable?: boolean;
  defaultValue?: unknown;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean;
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
  fields: Record<string, ComponentField>;
  preview?: {
    fields: string[];
    template?: string;
  };
  validation?: {
    rules?: Record<string, unknown>;
    messages?: Record<string, string>;
  };
}

export interface SchemaAwarePuckConfig extends PuckConfig {
  components: Record<
    string,
    {
      schema?: SchemaComponentConfig;
    } & PuckConfig['components'][string]
  >;
}
