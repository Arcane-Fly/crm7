'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Puck, type Data } from '@measured/puck';
import '@measured/puck/puck.css';
import { createClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { config } from './config';

interface EditorData {
  content: Record<string, unknown>;
  path: string;
}

interface EditorProps {
  data?: Data;
  onChange?: (data: Data) => void;
}

export function Editor({ data, onChange }: EditorProps) {
  const [path, setPath] = useState('');
  const [pages, setPages] = useState<EditorData[]>([]);
  const [initialData, setInitialData] = useState<Data | null>(null);

  const supabase = useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const loadPages = useCallback(async () => {
    const { data } = await supabase.from('pages').select('path, content').order('path');
    if (data) setPages(data);
  }, [supabase]);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  const loadPageContent = useCallback(async () => {
    if (!path) {
      setInitialData(null);
      return;
    }

    const { data } = await supabase.from('pages').select('content').eq('path', path).single();

    if (data) {
      setInitialData(data.content as Data);
    } else {
      setInitialData(null);
    }
  }, [path, supabase]);

  useEffect(() => {
    void loadPageContent();
  }, [loadPageContent]);

  const handlePublish = async (data: Data) => {
    try {
      const { error } = await supabase.from('pages').upsert({
        path,
        content: data,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: 'Changes saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-4 border-b">
        <div className="flex items-center gap-4 max-w-screen-lg mx-auto">
          <Label htmlFor="path">Page Path:</Label>
          <select
            id="path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full"
            aria-label="Select page path"
          >
            <option value="">Create New Page</option>
            {pages.map((page) => (
              <option key={page.path} value={page.path}>
                {page.path}
              </option>
            ))}
          </select>
          {path && (
            <Input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/training/courses/new"
              className="max-w-xs"
            />
          )}
        </div>
      </div>

      {(path || !initialData) && (
        <Puck
          config={config}
          data={initialData || {}}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
