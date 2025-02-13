import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Only load jest-canvas-mock in jsdom environment
if (typeof window !== 'undefined') {
  require('jest-canvas-mock');
}

// Suppress console errors during tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('punycode') ||
     args[0].includes('canvas'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock canvas only in jsdom environment
if (typeof window !== 'undefined') {
  jest.mock('canvas', () => {
    const Canvas = jest.requireActual('jest-canvas-mock');
    return {
      ...Canvas,
      createCanvas: (width: number, height: number) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
      },
      loadImage: async () => {
        const canvas = document.createElement('canvas');
        return canvas;
      },
    };
  });
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

import { configure } from '@testing-library/react';

configure({
  testIdAttribute: 'data-testid',
});
