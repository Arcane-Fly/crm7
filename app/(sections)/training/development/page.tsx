'use client';

import { PuckEditor } from '@/components/editor/puck-editor';
import { Breadcrumb, BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface TrainingData {
  content: Record<string, unknown>;
  path: string;
  title: string;
}

export default function TrainingDevelopmentPage() {
  const { toast } = useToast();

  const handlePublish = async (data: TrainingData) => {
    try {
      const response = await fetch('/api/training/development', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error('Service temporarily unavailable');
        }
        const error = await response.json();
        throw new Error(error.message || 'Failed to save changes');
      }

      const result = await response.json();
      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      });
      return result;
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save changes',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training & Development</h1>
          <Breadcrumb>
            <BreadcrumbItem>Training</BreadcrumbItem>
            <BreadcrumbItem>Development</BreadcrumbItem>
          </Breadcrumb>
        </div>
      </div>

      <Tabs defaultValue="editor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <PuckEditor onPublish={handlePublish} />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <p>Preview content will be displayed here</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
