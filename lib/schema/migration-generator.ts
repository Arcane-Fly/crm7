import { type TableSchema, type SchemaField } from '../types/schema-component';

interface MigrationOptions {
  timestamp?: boolean;
  format?: 'sql' | 'typescript';
}

export class MigrationGenerator {
  private getFieldDefinition(field: SchemaField): string {
    const type = this.mapFieldType(field.type);
    const nullableStr = field.nullable ? '' : ' NOT NULL';
    const defaultStr = field.defaultValue ? ` DEFAULT ${this.formatDefaultValue(field.defaultValue)}` : '';
    const referencesStr = field.references 
      ? ` REFERENCES ${field.references.table}(${field.references.field})${this.getOnDelete(field.references.onDelete)}`
      : '';

    return `${field.name} ${type}${nullableStr}${defaultStr}${referencesStr}`;
  }

  private mapFieldType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'TEXT',
      'number': 'NUMERIC',
      'boolean': 'BOOLEAN',
      'date': 'TIMESTAMP WITH TIME ZONE',
      'json': 'JSONB',
      'array': 'ARRAY',
    };
    return typeMap[type] || type.toUpperCase();
  }

  private formatDefaultValue(value: unknown): string {
    if (typeof value === 'string') return `'${value}'`;
    if (typeof value === 'object') return `'${JSON.stringify(value)}'::jsonb`;
    return String(value);
  }

  private getOnDelete(onDelete?: string): string {
    if (!onDelete) return '';
    return ` ON DELETE ${onDelete}`;
  }

  generateCreateTable(table: TableSchema): string {
    const fields = table.fields.map(field => this.getFieldDefinition(field)).join(',\n  ');
    const indices = (table.indices || [])
      .map(index => {
        const unique = index.unique ? ' UNIQUE' : '';
        return `CREATE${unique} INDEX ${index.name} ON ${table.name} (${index.fields.join(', ')});`;
      })
      .join('\n');

    const constraints = (table.constraints || [])
      .map(constraint => 
        `ALTER TABLE ${table.name} ADD CONSTRAINT ${constraint.name} ${constraint.type} ${constraint.definition};`
      )
      .join('\n');

    return `
-- Create table ${table.name}
CREATE TABLE ${table.name} (
  ${fields}
);

${indices}

${constraints}
`.trim();
  }

  generateDropTable(table: TableSchema): string {
    return `DROP TABLE IF EXISTS ${table.name} CASCADE;`;
  }

  generateAlterTable(oldTable: TableSchema, newTable: TableSchema): string {
    const changes: string[] = [];

    // Find removed fields
    const removedFields = oldTable.fields.filter(
      oldField => !newTable.fields.find(newField => newField.name === oldField.name)
    );
    removedFields.forEach(field => {
      changes.push(`ALTER TABLE ${newTable.name} DROP COLUMN ${field.name};`);
    });

    // Find added fields
    const addedFields = newTable.fields.filter(
      newField => !oldTable.fields.find(oldField => oldField.name === newField.name)
    );
    addedFields.forEach(field => {
      changes.push(`ALTER TABLE ${newTable.name} ADD COLUMN ${this.getFieldDefinition(field)};`);
    });

    // Find modified fields
    oldTable.fields.forEach(oldField => {
      const newField = newTable.fields.find(f => f.name === oldField.name);
      if (newField && JSON.stringify(oldField) !== JSON.stringify(newField)) {
        changes.push(
          `ALTER TABLE ${newTable.name} ALTER COLUMN ${this.getFieldDefinition(newField)};`
        );
      }
    });

    return changes.join('\n\n');
  }

  generateMigration(
    oldSchema: TableSchema[],
    newSchema: TableSchema[],
    options: MigrationOptions = {}
  ): string {
    const timestamp = options.timestamp 
      ? new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
      : '';
    
    const migrations: string[] = [];

    // Handle dropped tables
    oldSchema.forEach(oldTable => {
      if (!newSchema.find(t => t.name === oldTable.name)) {
        migrations.push(this.generateDropTable(oldTable));
      }
    });

    // Handle new tables
    newSchema.forEach(newTable => {
      if (!oldSchema.find(t => t.name === newTable.name)) {
        migrations.push(this.generateCreateTable(newTable));
      }
    });

    // Handle modified tables
    oldSchema.forEach(oldTable => {
      const newTable = newSchema.find(t => t.name === oldTable.name);
      if (newTable && JSON.stringify(oldTable) !== JSON.stringify(newTable)) {
        migrations.push(this.generateAlterTable(oldTable, newTable));
      }
    });

    if (options.format === 'typescript') {
      return `
import { type MigrationFn } from 'kysely';

export const up: MigrationFn = async (db) => {
  await db.executeQuery(\`
${migrations.join('\n\n')}
  \`);
};

export const down: MigrationFn = async (db) => {
  // TODO: Implement rollback logic
};
`.trim();
    }

    return migrations.join('\n\n');
  }
}

export const migrationGenerator = new MigrationGenerator();
