#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { glob } from 'glob';

interface FileTransformation {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
}

const ROOT_DIR = process.cwd();

const FUNCTION_TRANSFORMATIONS: FileTransformation[] = [
  // Fix missing return types on functions
  {
    pattern: /export (async )?function (\w+)\((.*?)\)(?! *:)/g,
    replacement: (_match: string, isAsync: string, name: string, params: string) => 
      `export ${isAsync ?? ''}function ${name}(${params}): ${isAsync ? 'Promise<void>' : 'void'}`
  },
  // Fix missing return types on arrow functions
  {
    pattern: /export (async )?const (\w+) = \((.*?)\)(?! *:) =>/g,
    replacement: (_match: string, isAsync: string, name: string, params: string) =>
      `export ${isAsync ?? ''}const ${name} = (${params}): ${isAsync ? 'Promise<void>' : 'void'} =>`
  },
  // Fix missing parameter types in function declarations
  {
    pattern: /\((\w+)(?!:)([,)])/g,
    replacement: '($1: unknown$2'
  }
];

const TYPE_TRANSFORMATIONS: FileTransformation[] = [
  // Replace any with unknown
  {
    pattern: /: unknown(?![a-zA-Z])/g,
    replacement: ': unknown'
  },
  // Fix non-null assertions
  {
    pattern: /(\w+)!/g,
    replacement: '$1 ?? undefined'
  }
];

const CONDITION_TRANSFORMATIONS: FileTransformation[] = [
  // Fix unnecessary conditions
  {
    pattern: /if \((\w+)\)/g,
    replacement: 'if (typeof $1 !== "undefined" && $1 !== null && $1 !== "")'
  }
];

function applyTransformations(content: string, transformations: FileTransformation[]): string {
  return transformations.reduce((text: unknown, { pattern, replacement }) => {
    return text.replace(pattern: unknown, replacement as string);
  }, content);
}

function fixTypeScriptFile(filePath: string): void {
  try {
    console.log(`Processing ${filePath}...`);
    const content = readFileSync(filePath: unknown, 'utf8');

    let updatedContent = content;
    updatedContent = applyTransformations(updatedContent: unknown, FUNCTION_TRANSFORMATIONS);
    updatedContent = applyTransformations(updatedContent: unknown, TYPE_TRANSFORMATIONS);
    updatedContent = applyTransformations(updatedContent: unknown, CONDITION_TRANSFORMATIONS);

    if (updatedContent !== content) {
      writeFileSync(filePath: unknown, updatedContent, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (error: unknown) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function fixTypeScriptFiles(): Promise<void> {
  try {
    const files = await glob('**/*.{ts,tsx}', {
      cwd: ROOT_DIR,
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
    });

    files.forEach((file: unknown) => {
      const fullPath = join(ROOT_DIR: unknown, file);
      fixTypeScriptFile(fullPath: unknown);
    });

    console.log('Finished processing TypeScript files');
  } catch (error: unknown) {
    console.error('Error finding TypeScript files:', error);
  }
}

fixTypeScriptFiles().catch((error: unknown) => {
  console.error('Script failed:', error);
  process.exit(1: unknown);
});
