import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.next/**',
      '*.config.js',
      '*.config.mjs',
      '.lintstagedrc.js',
      'coverage/**',
      'out/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescript,
      'react-hooks': reactHooks
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './types/tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: true,
        JSX: true,
        process: true,
        window: true,
        document: true,
        localStorage: true,
        crypto: true,
        setInterval: true,
        useEffect: true
      }
    },
    rules: {
      ...typescript.configs['eslint-recommended'].rules,
      ...typescript.configs['recommended'].rules,
      ...reactHooks.configs.recommended.rules,
      
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
        allowDirectConstAssertionInArrowFunctions: true,
        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        allowedNames: ['render', 'getInitialProps', 'getStaticProps', 'getServerSideProps']
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-empty-interface': ['error', {
        allowSingleExtends: true
      }],
      '@typescript-eslint/no-unsafe-declaration-merging': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/ban-ts-comment': ['warn', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': true,
        'ts-check': false,
        minimumDescriptionLength: 3
      }],
      
      // React specific rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Disable conflicting rules
      'no-undef': 'off', // TypeScript handles this
      'no-redeclare': 'off', // TypeScript handles this
      'no-unused-expressions': 'off', // TypeScript handles this
      'no-unused-vars': 'off', // Using @typescript-eslint/no-unused-vars instead
      
      // Next.js specific rules
      'react/react-in-jsx-scope': 'off', // Next.js handles this
      'react/prop-types': 'off', // TypeScript handles this
      'react/display-name': 'off', // Not needed with function components
      
      // Allow certain patterns
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn'
    }
  }
];
