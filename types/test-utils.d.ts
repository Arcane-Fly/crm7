import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

export interface TestRenderOptions extends RenderOptions {
  route?: string;
  initialState?: Record<string, unknown>;
}

export interface TestError extends Error {
  code?: string;
  details?: Record<string, unknown>;
}

export class TestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TestError';
  }
}

export function render(
  ui: ReactElement,
  options?: TestRenderOptions,
): ReturnType<typeof import('@testing-library/react')['render']>;

export * from '@testing-library/react';
