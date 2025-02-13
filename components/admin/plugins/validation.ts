import { type Plugin } from '@measured/puck';
import { type ExtendedPuckData } from '@/lib/types/puck';
import * as React from 'react';

const validateFields = (zones: ExtendedPuckData['zones']) => {
  const errors: Array<{ path: string; message: string }> = [];
  if (!zones) return { isValid: true, errors };

  let lastHeadingLevel = 0;

  // Iterate through each zone and its components
  for (const [zoneName, items] of Object.entries(zones)) {
    for (const item of items) {
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
  return React.createElement('div', {}, children);
}

export const validationPlugin: Plugin = {
  overrides: {
    headerActions: HeaderActions,
  },
};
