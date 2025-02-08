'use client';

import { PuckEditor } from '@/components/editor/puck-editor';
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

const initialData = {
  content: [
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
  ],
};

export default function EditorPage() {
  const { toast } = useToast();

  const handlePublish = useCallback(async (data: any) => {
    try {
      // Here you would typically save the data to your backend
      console.log('Publishing:', data);
      toast({
        title: 'Changes published',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish changes. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return (
    <div className="h-screen">
      <PuckEditor
        initialData={initialData}
        onPublish={handlePublish}
      />
    </div>
  );
}
