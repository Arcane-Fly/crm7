'use client';

import { PuckEditor } from '@/components/editor/puck-editor';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';

interface EditorData {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  version: number;
}

const initialData: EditorData = {
  id: '',
  content: '',
  metadata: {},
  version: 1,
  content: JSON.stringify([
    {
      type: 'Hero',
      props: {
        title: 'Welcome to the Editor',
        description: 'Try editing this page using the Puck editor!',
        ctaText: 'Get Started',
        ctaLink: '#',
      },
    },
    {
      type: 'Stats',
      props: {
        title: 'Our Impact',
        subtitle: 'See what we\'ve accomplished together',
        stats: [
          {
            label: 'Active Users',
            value: '10,000+',
            description: 'Growing every day',
          },
          {
            label: 'Success Rate',
            value: '99.9%',
            description: 'Industry-leading reliability',
          },
          {
            label: 'Customer Satisfaction',
            value: '4.9/5',
            description: 'Based on user reviews',
          },
        ],
      },
    },
  ]),
};

const saveContent = async () => {
  // Here you would typically save the data to your backend
  // For now, just return a resolved promise
  return Promise.resolve();
};

export default function EditorPage() {
  const [data] = useState<EditorData | null>(initialData);
  const { toast } = useToast();

  const handlePublish = useCallback(async (newData: EditorData) => {
    try {
      await saveContent(newData);
      toast({
        title: 'Changes published',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return (
    <div className="h-screen">
      <PuckEditor
        initialData={data}
        onPublish={handlePublish}
      />
    </div>
  );
}
