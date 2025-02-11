import { Plugin } from '@measured/puck';

interface ComponentData {
  type: string;
  props: Record<string, unknown>;
}

interface ZoneData {
  [zoneName: string]: ComponentData[];
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    path: string;
    message: string;
  }>;
}

const validateFields = (content: ZoneData): ValidationResult => {
  const errors: Array<{ path: string; message: string }> = [];

  if (!content) {
    return { isValid: true, errors: [] };
  }

  for (const [zoneName, items] of Object.entries(content)) {
    for (const item of items) {
      // Check for empty required fields
      if (item.props) {
        for (const [key, value] of Object.entries(item.props)) {
          if (item._requiredFields?.includes(key) && !value) {
            errors.push({
              path: `${zoneName}.${item.type}.${key}`,
              message: `${key} is required in ${item.type} component (${zoneName} zone)`,
            });
          }
        }
      }

      // Check for heading hierarchy
      if (item.type === 'Heading') {
        const level = parseInt(item.props.level || '1');
        const prevLevel = content._lastHeadingLevel || 0;

        if (level > prevLevel + 1) {
          errors.push({
            path: `${zoneName}.${item.type}`,
            message: `Heading level ${level} follows level ${prevLevel}. This may not meet WCAG 2 standards.`,
          });
        }

        content._lastHeadingLevel = level;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validationPlugin: Plugin = {
  overrides: {
    onPublish: async ({ data, defaultOnPublish }) => {
      const result = validateFields(data.zones);

      if (!result.isValid) {
        for (const error of result.errors) {
          console.error(`Validation Error: ${error.message}`);
        }
        return;
      }

      // Continue with default publish
      await defaultOnPublish();
    },
  },
};
