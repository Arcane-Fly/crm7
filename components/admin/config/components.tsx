import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { type Config } from '@measured/puck';
import Image from 'next/image';

interface ComponentProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export const components: Config['components'] = {
  Section: {
    fields: {
      backgroundColor: { type: 'text', defaultValue: '#ffffff' },
      padding: { type: 'select', options: ['none', 'small', 'medium', 'large'] },
      maxWidth: { type: 'text', defaultValue: '1200px' },
    },
    defaultProps: {
      padding: 'medium',
    },
    render: ({ backgroundColor, padding, maxWidth, children }: ComponentProps) => {
      const paddingMap = {
        none: '0',
        small: '1rem',
        medium: '2rem',
        large: '4rem',
      };

      return (
        <section
          style={{
            backgroundColor,
            padding: paddingMap[padding as keyof typeof paddingMap],
            maxWidth,
            margin: '0 auto',
          }}
        >
          {children}
        </section>
      );
    },
  },

  Columns: {
    fields: {
      columns: {
        type: 'array',
        defaultValue: [{ width: '1fr' }, { width: '1fr' }],
        fields: {
          width: { type: 'text' },
        },
      },
      gap: { type: 'text', defaultValue: '1rem' },
    },
    render: ({ columns, gap, children }: ComponentProps) => {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: columns.map((col: { width: string }) => col.width).join(' '),
            gap,
          }}
        >
          {children}
        </div>
      );
    },
  },

  Card: {
    fields: {
      title: { type: 'text' },
      description: { type: 'textarea' },
      imageUrl: {
        type: 'external',
        options: async () => {
          // You can fetch image options from your API
          return [
            { label: 'Image 1', value: '/images/1.jpg' },
            { label: 'Image 2', value: '/images/2.jpg' },
          ];
        },
      },
      action: {
        type: 'object',
        fields: {
          label: { type: 'text' },
          url: { type: 'text' },
        },
      },
    },
    render: ({ title, description, imageUrl, action }: ComponentProps) => (
      <Card>
        {imageUrl && (
          <div className="relative aspect-video">
            <Image
              src={imageUrl}
              alt={title || 'Content image'}
              width={800}
              height={600}
              layout="responsive"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
          {action && (
            <Button onClick={() => (window.location.href = action.url)} className="mt-4">
              {action.label}
            </Button>
          )}
        </CardContent>
      </Card>
    ),
  },

  Form: {
    fields: {
      title: { type: 'text' },
      fields: {
        type: 'array',
        fields: {
          type: {
            type: 'radio',
            options: ['text', 'textarea', 'select', 'radio', 'number'],
          },
          label: { type: 'text' },
          name: { type: 'text' },
          required: { type: 'radio', options: ['yes', 'no'] },
          options: {
            type: 'array',
            fields: {
              label: { type: 'text' },
              value: { type: 'text' },
            },
            showIf: (values) => ['select', 'radio'].includes(values?.type),
          },
        },
      },
      submitLabel: { type: 'text', defaultValue: 'Submit' },
      action: { type: 'text', defaultValue: '/api/submit' },
    },
    render: ({ title, fields, submitLabel, action }: ComponentProps) => (
      <form action={action} className="space-y-6">
        {title && <h2 className="text-2xl font-bold">{title}</h2>}
        {fields?.map(
          (
            field: {
              type: string;
              label: string;
              name: string;
              required: string;
              options: { label: string; value: string }[];
            },
            index: number
          ) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === 'text' && (
                <Input id={field.name} name={field.name} required={field.required === 'yes'} />
              )}
              {field.type === 'textarea' && (
                <Textarea id={field.name} name={field.name} required={field.required === 'yes'} />
              )}
              {field.type === 'select' && (
                <Select name={field.name} required={field.required === 'yes'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt: { label: string; value: string }, i: number) => (
                      <SelectItem key={i} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === 'radio' && (
                <RadioGroup name={field.name} required={field.required === 'yes'}>
                  {field.options?.map((opt: { label: string; value: string }, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`${field.name}-${i}`} />
                      <Label htmlFor={`${field.name}-${i}`}>{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {field.type === 'number' && (
                <Input
                  type="number"
                  id={field.name}
                  name={field.name}
                  required={field.required === 'yes'}
                />
              )}
            </div>
          )
        )}
        <Button type="submit">{submitLabel}</Button>
      </form>
    ),
  },

  Tabs: {
    fields: {
      items: {
        type: 'array',
        fields: {
          label: { type: 'text' },
          content: { type: 'textarea' },
        },
      },
    },
    render: ({ items }: ComponentProps) => (
      <Tabs defaultValue={items?.[0]?.label}>
        <TabsList>
          {items?.map((item: { label: string }, index: number) => (
            <TabsTrigger key={index} value={item.label}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {items?.map((item: { label: string; content: string }, index: number) => (
          <TabsContent key={index} value={item.label}>
            {item.content}
          </TabsContent>
        ))}
      </Tabs>
    ),
  },

  CustomComponent: {
    fields: {
      customField: {
        type: 'custom',
        render: ({ value, onChange }: ComponentProps) => {
          return (
            <div className="space-y-2">
              <Label>Custom Field</Label>
              <div className="flex gap-2">
                <Input value={value} onChange={(e) => onChange(e.target.value)} />
                <Button onClick={() => onChange(Math.random().toString(36))}>
                  Generate Random
                </Button>
              </div>
            </div>
          );
        },
      },
    },
    render: ({ customField }: ComponentProps) => (
      <div className="p-4 border rounded">
        <p>Custom Value: {customField}</p>
      </div>
    ),
  },
};
