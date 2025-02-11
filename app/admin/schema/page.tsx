'use client';

import React from 'react';
import { SchemaEditor } from '@/components/schema/SchemaEditor';
import { SchemaHistory } from '@/lib/schema/schema-history';
import { migrationGenerator } from '@/lib/schema/migration-generator';
import type { TableSchema } from '@/lib/types/schema-component';

const schemaHistory = new SchemaHistory();

export default function SchemaPage(): React.ReactElement {
  const [currentSchema, setCurrentSchema] = React.useState<TableSchema[]>([]);

  const handleSchemaChange = (newSchema: TableSchema[]): void => {
    schemaHistory.push(newSchema, 'Updated schema configuration');
    setCurrentSchema(newSchema);
  };

  const handleUndo = (): void => {
    const previousEntry = schemaHistory.undo();
    if (previousEntry) {
      setCurrentSchema(previousEntry.schema);
    }
  };

  const handleRedo = (): void => {
    const nextEntry = schemaHistory.redo();
    if (nextEntry) {
      setCurrentSchema(nextEntry.schema);
    }
  };

  const handleGenerateMigration = async (): Promise<void> => {
    try {
      const migration = await migrationGenerator.generateMigration([], currentSchema, {
        timestamp: true,
        format: 'typescript',
      });
      console.warn('Migration generated:', migration);
    } catch (error) {
      console.error('Failed to generate migration:', error);
    }
  };

  return (
    <div>
      <SchemaEditor schema={currentSchema} onChange={handleSchemaChange} />
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={handleGenerateMigration}>Generate Migration</button>
    </div>
  );
}
