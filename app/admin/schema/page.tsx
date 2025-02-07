'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type TableSchema } from '@/lib/types/schema-component';
import { RelationshipGraph } from '@/components/schema/RelationshipGraph';
import { DataPreview } from '@/components/schema/DataPreview';
import { migrationGenerator } from '@/lib/schema/migration-generator';
import { MigrationHandler } from '@/lib/schema/migration-handler';
import { SchemaHistory } from '@/lib/schema/schema-history';
import { SchemaEditor } from '@/components/schema/SchemaEditor';
import path from 'path';

const migrationHandler = new MigrationHandler(path.join(process.cwd(), 'migrations'));
const schemaHistory = new SchemaHistory();

interface Profile {
  role: string;
  can_manage_schema: boolean;
}

export default async function SchemaPage() {
  const cookieStore = cookies();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/auth/signin');
  }

  // Check if user is admin or authorized dev
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, can_manage_schema')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && !(profile.role === 'dev' && profile.can_manage_schema))) {
    return redirect('/dashboard');
  }

  const [currentSchema, setCurrentSchema] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [migrationDescription, setMigrationDescription] = useState('');
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [migrationHistory, setMigrationHistory] = useState<Array<{
    filename: string;
    timestamp: string;
    description: string;
  }>>([]);

  useEffect(() => {
    // Load migration history
    migrationHandler.getMigrationHistory().then(setMigrationHistory);
  }, []);

  const handleSchemaChange = useCallback((newSchema: TableSchema[]) => {
    setCurrentSchema(newSchema);
    schemaHistory.push(newSchema, 'Schema update');
  }, []);

  const handleUndo = useCallback(() => {
    const previous = schemaHistory.undo();
    if (previous) {
      setCurrentSchema(previous.schema);
      toast({
        title: 'Changes Undone',
        description: `Reverted to: ${previous.description}`,
      });
    }
  }, []);

  const handleRedo = useCallback(() => {
    const next = schemaHistory.redo();
    if (next) {
      setCurrentSchema(next.schema);
      toast({
        title: 'Changes Redone',
        description: `Applied: ${next.description}`,
      });
    }
  }, []);

  const handleGenerateMigration = useCallback(async () => {
    if (!migrationDescription) {
      toast({
        variant: 'destructive',
        title: 'Missing Description',
        description: 'Please provide a description for the migration.',
      });
      return;
    }

    try {
      const current = schemaHistory.getCurrentState();
      const previous = schemaHistory.getHistory()[schemaHistory.getHistory().length - 2];

      if (!current || !previous) {
        toast({
          variant: 'destructive',
          title: 'No Changes',
          description: 'No schema changes to migrate.',
        });
        return;
      }

      const filename = await migrationHandler.saveMigration(
        previous.schema,
        current.schema,
        migrationDescription
      );

      setShowMigrationDialog(false);
      setMigrationDescription('');

      // Refresh migration history
      const history = await migrationHandler.getMigrationHistory();
      setMigrationHistory(history);

      toast({
        title: 'Migration Generated',
        description: `Migration file ${filename} has been created.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Generating Migration',
        description: (error as Error).message,
      });
    }
  }, [migrationDescription]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schema Management</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleUndo}
            disabled={!schemaHistory.canUndo()}
          >
            Undo
          </Button>
          <Button
            variant="outline"
            onClick={handleRedo}
            disabled={!schemaHistory.canRedo()}
          >
            Redo
          </Button>
          <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                disabled={currentSchema.length === 0}
              >
                Generate Migration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Migration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Migration Description</Label>
                  <Input
                    id="description"
                    value={migrationDescription}
                    onChange={(e) => setMigrationDescription(e.target.value)}
                    placeholder="e.g., Add user preferences table"
                  />
                </div>
                <Button
                  onClick={handleGenerateMigration}
                  disabled={!migrationDescription}
                >
                  Generate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList>
          <TabsTrigger value="editor">Schema Editor</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="preview">Data Preview</TabsTrigger>
          <TabsTrigger value="history">Migration History</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <SchemaEditor
            initialSchema={currentSchema}
            onChange={handleSchemaChange}
            onSelectTable={setSelectedTable}
          />
        </TabsContent>

        <TabsContent value="relationships" className="mt-6">
          <div className="border rounded-lg bg-white">
            <RelationshipGraph
              tables={currentSchema}
              width={1200}
              height={800}
              onTableSelect={setSelectedTable}
            />
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {selectedTable ? (
            <DataPreview
              table={currentSchema.find(t => t.name === selectedTable)!}
              limit={10}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a table from the schema editor to preview its data
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <div className="border rounded-lg divide-y">
            {migrationHistory.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No migrations yet
              </div>
            ) : (
              migrationHistory.map((migration, i) => (
                <div
                  key={i}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{migration.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(migration.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <code className="text-sm text-muted-foreground">
                      {migration.filename}
                    </code>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
