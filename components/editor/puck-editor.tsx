'use client';

import { Puck } from '@measured/puck';
import { type Config } from '@measured/puck';
import { useCallback, useState } from 'react';
import { config } from '@/lib/puck/config';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';

interface PuckEditorProps {
  initialData?: any;
  onPublish?: (data: any) => Promise<void>;
}

export function PuckEditor({ initialData, onPublish }: PuckEditorProps) {
  const [error, setError] = useState<Error | null>(null);

  const handlePublish = useCallback(async (data: any) => {
    try {
      setError(null);
      if (onPublish) {
        await onPublish(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to publish'));
    }
  }, [onPublish]);

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
          config={config as Config}
          data={initialData}
          onPublish={handlePublish}
          renderHeader={({ actions }) => (
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-semibold">Page Editor</h1>
              <div className="flex gap-2">
                {actions}
              </div>
            </div>
          )}
        />
      </div>
    </ErrorBoundary>
  );
}
