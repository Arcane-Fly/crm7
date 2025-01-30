'use client';

import { Settings2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAdminAccess } from '@/lib/hooks/useAdminAccess';
import { createClient } from '@/lib/supabase/client';

interface SchemaEditorProps {
  table: string;
  onUpdate: () => void;
}

export function SchemaEditor({ table, onUpdate }: SchemaEditorProps) {
  const { isAdmin } = useAdminAccess();
  const [isOpen, setIsOpen] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'text' });
  const { toast } = useToast();
  const supabase = createClient();

  if (!isAdmin) return null;

  const handleAddColumn = async () => {
    try {
      // Add column to the table
      const { error: schemaError } = await supabase.rpc('add_column_to_table', {
        p_table_name: table,
        p_column_name: newColumn.name,
        p_column_type: newColumn.type,
      });

      if (schemaError) throw schemaError;

      onUpdate();
      setIsOpen(false);
      toast({
        title: 'Column added',
        description: 'The new column has been added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add column. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
        >
          <Settings2 className='mr-2 h-4 w-4' />
          Edit Schema
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Table Schema</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>Column Name</Label>
            <Input
              value={newColumn.name}
              onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
              placeholder='Enter column name'
            />
          </div>
          <div className='space-y-2'>
            <Label>Column Type</Label>
            <Select
              value={newColumn.type}
              onValueChange={(value) => setNewColumn({ ...newColumn, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select column type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='text'>Text</SelectItem>
                <SelectItem value='integer'>Integer</SelectItem>
                <SelectItem value='boolean'>Boolean</SelectItem>
                <SelectItem value='timestamp'>Timestamp</SelectItem>
                <SelectItem value='jsonb'>JSONB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddColumn}>Add Column</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
