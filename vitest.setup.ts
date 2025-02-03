import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, expect, vi } from 'vitest';

// Create a proper Response mock class
class MockResponse implements Partial<Response> {
  static error(): Response {
    return new Response(null, { status: 500 });
  }

  static json(data: unknown, init?: ResponseInit): Response {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
  }

  static redirect(url: string | URL, status = 302): Response {
    return new Response(null, {
      status,
      headers: { Location: url.toString() },
    });
  }
}

// Mock fetch globally
beforeAll(() => {
  global.fetch = vi.fn();
  global.Request = vi.fn() as unknown as typeof Request;
  global.Headers = vi.fn() as unknown as typeof Headers;
  global.Response = MockResponse as unknown as typeof Response;
});

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.resetModules();
});
