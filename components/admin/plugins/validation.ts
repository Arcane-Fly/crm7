import { type Plugin, type Data } from '@measured/puck';
import { type ExtendedPuckData } from '@/lib/types/puck';
import * as React from 'react';
import { toast } from '@/components/ui/use-toast';

interface ValidationItem extends Data {
  type: string;
  props: Record<string, unknown>;
  _requiredFields?: string[];
}

const validateFields = (zones: ExtendedPuckData['zones']) => {
  const errors: Array<{ path: string; message: string }> = [];
  if (!zones) return { isValid: true, errors };

  let lastHeadingLevel = 0;

  // Iterate through each zone and its components
  for (const [zoneName, items] of Object.entries(zones)) {
    for (const item of items as ValidationItem[]) {
      if (item.props) {
        for (const [key, value] of Object.entries(item.props)) {
          if (item._requiredFields?.includes(key) && !value) {
            errors.push({
              path: `${zoneName}.${item.type}.${key}`,
              message: `${key} is required in ${item.type} component (${zoneName} zone)`
            });
          }
        }
      }
      if (item.type === 'Heading' && typeof item.props?.level === 'string') {
        const level = parseInt(item.props.level || '1', 10);
        if (level > lastHeadingLevel + 1) {
          errors.push({
            path: `${zoneName}.${item.type}`,
            message: `Heading level ${level} is too high compared to previous level ${lastHeadingLevel}; must not skip levels to meet WCAG 2 standards.`
          });
        }
        lastHeadingLevel = level;
      }
    }
  }
  return { isValid: errors.length === 0, errors };
};

function HeaderActions({ children }: { children: React.ReactNode }): React.ReactElement {
  const handleValidateClick = React.useCallback(() => {
    const items = document.querySelectorAll('[data-item]');
    if (!items) return;
    
    const itemArray = Array.from(items);
    for (const item of itemArray) {
      const validation = validateFields({ default: [{ type: item.getAttribute('data-type') || '', props: {} }] });
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast({
            title: 'Validation Error',
            description: error.message,
            variant: 'destructive'
          });
        });
      }
    }
  }, []);

  return React.createElement('div', null,
    children,
    React.createElement('button', { onClick: handleValidateClick }, 'Validate')
  );
}

export const validationPlugin: Plugin = {
  overrides: {
    headerActions: (props) => React.createElement(HeaderActions, props),
  },
};
