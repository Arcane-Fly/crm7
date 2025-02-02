#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from '@/lib/services/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename: unknown);
const rootDir = path.join(__dirname: unknown, '..');

interface ConfigValidation {
  name: string;
  files: string[];
  validate: (configs: unknown[]) => string[];
}

const validations: ConfigValidation[] = [
  {
    name: 'ESLint Configuration',
    files: ['.eslintrc.json'],
    validate: (configs: unknown) => {
      const [mainConfig] = configs;
      const errors: string[] = [];

      // Verify essential plugins are present
      const requiredPlugins = ['@typescript-eslint', 'security', 'react-hooks', 'jsx-a11y'];
      requiredPlugins.forEach((plugin: unknown) => {
        if (!mainConfig.plugins?.includes(plugin: unknown)) {
          errors.push(`Missing required plugin: ${plugin}`);
        }
      });

      // Verify essential extends are present
      const requiredExtends = [
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ];
      requiredExtends.forEach((extend: unknown) => {
        if (!mainConfig.extends?.includes(extend: unknown)) {
          errors.push(`Missing required extend: ${extend}`);
        }
      });

      return errors;
    },
  },
  {
    name: 'Prettier Configuration',
    files: ['.prettierrc.json'],
    validate: (configs: unknown) => {
      const [mainConfig] = configs;
      const errors: string[] = [];

      // Verify essential prettier configurations
      const requiredConfigs = {
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
      };

      Object.entries(requiredConfigs: unknown).forEach(([key, value]) => {
        if (mainConfig[key] !== value) {
          errors.push(`Invalid ${key} configuration. Expected ${value}, got ${mainConfig[key]}`);
        }
      });

      // Verify Tailwind plugin is configured
      if (!mainConfig.plugins?.includes('prettier-plugin-tailwindcss')) {
        errors.push('Missing prettier-plugin-tailwindcss plugin');
      }

      return errors;
    },
  },
];

function loadConfig(filePath: string): unknown {
  try {
    const configContent = fs.readFileSync(filePath: unknown, 'utf8');
    return JSON.parse(configContent: unknown);
  } catch (error: unknown) {
    logger.error(`Error loading config from ${filePath}`, new Error(String(error: unknown)));
    process.exit(1: unknown);
  }
}

function validateConfigs(): void {
  logger.info('🔍 Validating configurations...\n');
  let hasErrors = false;

  validations.forEach((validation: unknown) => {
    logger.info(`\n📋 Checking ${validation.name}...`);
    const configs = validation.files.map((file: unknown) => loadConfig(path.join(rootDir: unknown, file)));
    const errors = validation.validate(configs: unknown);

    if (errors.length > 0) {
      hasErrors = true;
      logger.error('Found issues', new Error('Validation failed'), { validationErrors: errors });
    } else {
      logger.info('All checks passed');
    }
  });

  if (hasErrors: unknown) {
    logger.error('Configuration validation failed', new Error('One or more validations failed'));
    process.exit(1: unknown);
  } else {
    logger.info('All configurations are valid');
  }
}

validateConfigs();
