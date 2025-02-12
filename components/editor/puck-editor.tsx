'use client';

import { Puck, type Config, type Data, type DefaultComponentProps } from '@measured/puck';
import { useCallback, useState } from 'react';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

type Content = Array<{
  type: string;
  props: DefaultComponentProps;
}>;

interface EditorData extends Omit<Data, 'content'> {
  id: string;
  metadata: Record<string, unknown>;
  version: number;
  root: Record<string, unknown>;
  content: Content;
}

interface PuckEditorProps {
  initialData?: EditorData;
  onPublish?: (data: EditorData) => Promise<void>;
}

export function PuckEditor({ initialData, onPublish }: PuckEditorProps) {
  const [error, setError] = useState<Error | null>(null);

  const config: Config = {
    components: {
      // Define your components here
    },
  };

  const handlePublish = useCallback(async (data: Data) => {
    try {
      setError(null);
      if (onPublish) {
        const editorData: EditorData = {
          ...data,
          id: initialData?.id || '',
          metadata: initialData?.metadata || {},
          version: initialData?.version || 1,
          root: initialData?.root || {},
          content: (data.content || []) as Content,
        };
        await onPublish(editorData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish'));
    }
  }, [onPublish, initialData]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500">
        <h3 className="font-semibold">Error</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen">
        <Puck
          config={config}
          data={initialData as Data || {}}
          onPublish={handlePublish}
          renderHeader={({ children }) => (
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-semibold">Page Editor</h1>
              <div className="flex gap-2">
                {children}
              </div>
            </div>
          )}
        />
      </div>
    </ErrorBoundary>
  );
}
