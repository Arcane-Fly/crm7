import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'coverage/**',
        '**/*.d.ts',
        'vitest.config.ts',
        'vitest.setup.ts',
        'postcss.config.js',
        'tailwind.config.ts',
        'next.config.mjs',
      ],
      functions: 80,
      lines: 80,
      statements: 80,
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