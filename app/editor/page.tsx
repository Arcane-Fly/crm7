'use client';

import { PuckEditor } from '@/components/editor/puck-editor';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useState } from 'react';
import type { Data as PuckData, Content } from '@measured/puck';

interface EditorData extends PuckData {
  id: string;
  metadata: Record<string, unknown>;
  version: number;
  root: any;
}

const initialContent: Content = [
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
];

const initialData: EditorData = {
  id: '',
  metadata: {},
  version: 1,
  root: {},
  content: initialContent,
};

export default function EditorPage() {
  const [data] = useState<EditorData>(initialData);
  const { toast } = useToast();

  const handlePublish = useCallback(async (data: EditorData) => {
    try {
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
