import { type TableSchema } from '../types/schema-component';
import { migrationGenerator } from './migration-generator';
import fs from 'fs/promises';
import path from 'path';

export class MigrationHandler {
  private readonly migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = migrationsDir;
  }

  async saveMigration(
    oldSchema: TableSchema[],
    newSchema: TableSchema[],
    description: string
  ): Promise<string> {
    // Create migrations directory if it doesn't exist
    await fs.mkdir(this.migrationsDir, { recursive: true });

    // Generate migration content
    const migration = migrationGenerator.generateMigration(
      oldSchema,
      newSchema,
      { timestamp: true, format: 'typescript' }
    );

    // Create migration file name
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const safeDescription = description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const filename = `${timestamp}_${safeDescription}.ts`;
    const filePath = path.join(this.migrationsDir, filename);

    // Save migration file
    await fs.writeFile(filePath, migration, 'utf-8');

    // Update migrations index
    await this.updateMigrationsIndex();

    return filename;
  }

  private async updateMigrationsIndex(): Promise<void> {
    const indexPath = path.join(this.migrationsDir, 'index.ts');
    const files = await fs.readdir(this.migrationsDir);
    const migrations = files
      .filter(f => f.endsWith('.ts') && f !== 'index.ts')
      .sort();

    const indexContent = `// This file is auto-generated. Do not edit it manually.
import { type Kysely } from 'kysely';

${migrations
  .map((file, i) => `import * as migration${i} from './${file.replace('.ts', '')}';`)
  .join('\n')}

export const migrations = [
${migrations
  .map((_, i) => `  {
    up: migration${i}.up,
    down: migration${i}.down,
  },`)
  .join('\n')}
];

export type Migration = {
  up: (db: Kysely<any>) => Promise<void>;
  down: (db: Kysely<any>) => Promise<void>;
};

export async function applyMigrations(db: Kysely<any>): Promise<void> {
  for (const migration of migrations) {
    try {
      await migration.up(db);
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
}

export async function revertMigration(db: Kysely<any>): Promise<void> {
  const lastMigration = migrations[migrations.length - 1];
  if (lastMigration) {
    try {
      await lastMigration.down(db);
    } catch (error) {
      console.error('Migration revert failed:', error);
      throw error;
    }
  }
}
`;

    await fs.writeFile(indexPath, indexContent, 'utf-8');
  }

  async getMigrationHistory(): Promise<Array<{
    filename: string;
    timestamp: string;
    description: string;
  }>> {
    const files = await fs.readdir(this.migrationsDir);
    return files
      .filter(f => f.endsWith('.ts') && f !== 'index.ts')
      .map(filename => {
        const [timestamp, ...descParts] = filename.replace('.ts', '').split('_');
        return {
          filename,
          timestamp: this.formatTimestamp(timestamp),
          description: descParts.join('_').replace(/_/g, ' '),
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  private formatTimestamp(timestamp: string): string {
    const date = new Date(
      parseInt(timestamp.slice(0, 4)),
      parseInt(timestamp.slice(4, 6)) - 1,
      parseInt(timestamp.slice(6, 8)),
      parseInt(timestamp.slice(8, 10)),
      parseInt(timestamp.slice(10, 12)),
      parseInt(timestamp.slice(12, 14))
    );
    return date.toISOString();
  }
}
