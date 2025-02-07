'use client';

import { DataPreview } from '@/components/schema/DataPreview';
import { RelationshipGraph } from '@/components/schema/RelationshipGraph';
import { SchemaEditor } from '@/components/schema/SchemaEditor';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { migrationGenerator } from '@/lib/schema/migration-generator';
import { SchemaHistory } from '@/lib/schema/schema-history';
import { type TableSchema } from '@/lib/types/schema-component';
import { useCallback, useState } from 'react';

const schemaHistory = new SchemaHistory();

export default function SchemaPage() {
  const [currentSchema, setCurrentSchema] = useState<TableSchema[]>([]);
  const [migrationDescription, setMigrationDescription] = useState('');
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);

  const handleSchemaChange = useCallback((newSchema: TableSchema[]) => {
    setCurrentSchema(newSchema);
    schemaHistory.push(newSchema);
  }, []);

  const handleUndo = useCallback(() => {
    const previousSchema = schemaHistory.undo();
    if (previousSchema) {
      setCurrentSchema(previousSchema);
    }
  }, []);

  const handleRedo = useCallback(() => {
    const nextSchema = schemaHistory.redo();
    if (nextSchema) {
      setCurrentSchema(nextSchema);
    }
  }, []);

  const handleGenerateMigration = useCallback(async () => {
    try {
      const migration = migrationGenerator.generate(currentSchema);
      const response = await fetch('/api/migrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          migration,
          description: migrationDescription,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      toast({
        title: 'Migration Generated',
        description: 'Migration file has been created successfully.',
      });
      setShowMigrationDialog(false);
    } catch (error) {
      console.error('Failed to generate migration:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate migration file.',
        variant: 'destructive',
      });
    }
  }, [currentSchema, migrationDescription]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Schema Management</h1>
        <div className="flex gap-2">
          <Button onClick={handleUndo} variant="outline" size="sm">
            Undo
          </Button>
          <Button onClick={handleRedo} variant="outline" size="sm">
            Redo
          </Button>
          <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
            <DialogTrigger asChild>
              <Button>Generate Migration</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Migration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Migration Description</Label>
                  <Input
                    id="description"
                    value={migrationDescription}
                    onChange={(e) => setMigrationDescription(e.target.value)}
                    placeholder="Describe your schema changes..."
                  />
                </div>
                <Button onClick={handleGenerateMigration}>Generate</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">Schema Editor</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <SchemaEditor schema={currentSchema} onChange={handleSchemaChange} />
        </TabsContent>
        <TabsContent value="relationships">
          <RelationshipGraph schema={currentSchema} />
        </TabsContent>
        <TabsContent value="preview">
          <DataPreview schema={currentSchema} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
