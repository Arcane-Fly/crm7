import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { createClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { config } from './config';

interface EditorData {
  content: Record<string, unknown>;
  path: string;
}

interface EditorProps {
  _data: Record<string, unknown>;
  _onChange: (data: Record<string, unknown>) => void;
}

export const Editor: React.FC<EditorProps> = ({ _data, _onChange }) => {
  const [path, setPath] = useState('');
  const [pages, setPages] = useState<EditorData[]>([]);
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

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
    loadPages();
  }, [loadPages]);

  const loadPageContent = useCallback(async () => {
    if (!path) {
      setInitialData(null);
      return;
    }

    const { data } = await supabase.from('pages').select('content').eq('path', path).single();

    if (data) {
      setInitialData(data.content);
    } else {
      setInitialData(null);
    }
  }, [path, supabase]);

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  const handlePublish = async (data: Record<string, unknown>) => {
    try {
      // Save page content
      const { error: contentError } = await supabase.from('pages').upsert({
        path,
        content: data,
        updated_at: new Date().toISOString(),
      });

      if (contentError) throw contentError;

      // Extract and save schema updates
      const fields = extractSchemaFromContent(data);
      if (fields.length > 0) {
        const { error: schemaError } = await supabase.from('schema_updates').insert({
          table_name: path.replace(/\//g, '_'),
          fields,
          status: 'pending',
        });

        if (schemaError) throw schemaError;
      }

      toast({
        title: 'Changes saved',
        description: 'Your changes have been saved and schema updates queued.',
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
          <div className="flex gap-2 ml-auto">
            <Button
              variant={viewportSize === 'desktop' ? 'default' : 'outline'}
              onClick={() => setViewportSize('desktop')}
            >
              Desktop
            </Button>
            <Button
              variant={viewportSize === 'tablet' ? 'default' : 'outline'}
              onClick={() => setViewportSize('tablet')}
            >
              Tablet
            </Button>
            <Button
              variant={viewportSize === 'mobile' ? 'default' : 'outline'}
              onClick={() => setViewportSize('mobile')}
            >
              Mobile
            </Button>
          </div>
        </div>
      </div>

      {(path || !initialData) && (
        <Puck
          config={{
            ...config,
            viewports: {
              desktop: { width: '100%', label: 'Desktop' },
              tablet: { width: '768px', label: 'Tablet' },
              mobile: { width: '360px', label: 'Mobile' },
            },
          }}
          onPublish={handlePublish}
          data={initialData}
          viewportSize={viewportSize}
          renderHeader={({ actions }) => (
            <div className="flex justify-between items-center p-4 border-b">
              <h1 className="text-xl font-bold">{initialData ? 'Edit Page' : 'Create New Page'}</h1>
              <div className="flex gap-2">{actions}</div>
            </div>
          )}
        />
      )}
    </div>
  );
};

// Helper function to extract schema updates from content
function extractSchemaFromContent(
  content: Record<string, unknown>
): Array<{ name: string; type: string }> {
  const fields: Array<{ name: string; type: string }> = [];

  // Recursively search for form fields in the content
  const searchFields = (obj: Record<string, unknown>) => {
    if (!obj || typeof obj !== 'object') return;

    if (obj.type === 'Input' || obj.type === 'Select') {
      fields.push({
        name: obj.props?.name || '',
        type: obj.type === 'Input' ? 'text' : 'enum',
      });
    }

    Object.values(obj).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach(searchFields);
      } else if (typeof value === 'object') {
        searchFields(value);
      }
    });
  };

  searchFields(content);
  return fields;
}
