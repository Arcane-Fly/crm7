'use client';

import { Edit2 } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { useAdminAccess } from '@/lib/hooks/useAdminAccess';
import { createClient } from '@/lib/supabase/client';

interface FieldEditorProps {
  table: string;
  column: string;
  recordId: string;
  value: any;
  onUpdate: (newValue: any) => void;
}

export function FieldEditor({ table, column, recordId, value, onUpdate }: FieldEditorProps) {
  const { isAdmin } = useAdminAccess();
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const { toast } = useToast();
  const supabase = createClient();

  if (!isAdmin) return null;

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ [column]: editValue })
        .eq('id', recordId);

      if (error) throw error;

      onUpdate(editValue);
      setIsOpen(false);
      toast({
        title: 'Field updated',
        description: 'The changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update field. Please try again.',
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
          variant='ghost'
          size='icon'
          className='ml-2 h-4 w-4'
        >
          <Edit2 className='h-3 w-3' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Field</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label>Value</Label>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
          </div>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
