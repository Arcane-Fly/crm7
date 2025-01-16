/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__mocks__/*',
        '**/node_modules/**',
      ],
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/types': path.resolve(__dirname, './types'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/styles': path.resolve(__dirname, './styles'),
      '@/app': path.resolve(__dirname, './app'),
      '@/config': path.resolve(__dirname, './config'),
      '@/constants': path.resolve(__dirname, './constants'),
      '@/context': path.resolve(__dirname, './context'),
      '@/services': path.resolve(__dirname, './services'),
      '@/store': path.resolve(__dirname, './store'),
      '@/tests': path.resolve(__dirname, './tests'),
    },
  },
})