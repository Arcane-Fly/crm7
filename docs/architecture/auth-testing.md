# Authentication Testing Guide

## Test Environment Setup

```typescript
// test/setup/auth-setup.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { createMocks } from 'node-mocks-http';

const mockAuthServer = setupServer(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),
  // Add other auth endpoints
);
```

## Test Suites

### 1. Middleware Tests

```typescript
// test/middleware.test.ts
describe('Authentication Middleware', () => {
  test('redirects to login for protected routes when not authenticated', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/dashboard',
    });

    await middleware(req, res);
    expect(res.statusCode).toBe(302);
    expect(res.getHeader('Location')).toMatch(/\/login/);
  });

  test('allows access to public routes without authentication', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/login',
    });

    await middleware(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('preserves return URL in login redirect', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      url: '/dashboard/reports',
    });

    await middleware(req, res);
    expect(res.getHeader('Location')).toContain('returnTo=/dashboard/reports');
  });
});
```

### 2. Authentication Flow Tests

```typescript
// test/auth-flow.test.ts
describe('Authentication Flow', () => {
  test('successful login redirects to original destination', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
      query: {
        returnTo: '/dashboard',
      },
    });

    await loginHandler(req, res);
    expect(res.statusCode).toBe(302);
    expect(res.getHeader('Location')).toBe('/dashboard');
  });

  test('failed login returns error message', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });

    await loginHandler(req, res);
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});
```

### 3. Session Management Tests

```typescript
// test/session.test.ts
describe('Session Management', () => {
  test('session is properly initialized after login', async () => {
    // Test implementation
  });

  test('session is cleared after logout', async () => {
    // Test implementation
  });

  test('session expires after timeout', async () => {
    // Test implementation
  });
});
```

### 4. Role-Based Access Tests

```typescript
// test/rbac.test.ts
describe('Role-Based Access Control', () => {
  test('admin can access admin routes', async () => {
    // Test implementation
  });

  test('user cannot access admin routes', async () => {
    // Test implementation
  });

  test('unauthenticated user cannot access protected routes', async () => {
    // Test implementation
  });
});
```

### 5. Security Tests

```typescript
// test/security.test.ts
describe('Security Features', () => {
  test('rate limiting prevents brute force attempts', async () => {
    // Test implementation
  });

  test('CSRF token is required for mutations', async () => {
    // Test implementation
  });

  test('session cookies have proper security flags', async () => {
    // Test implementation
  });
});
```

## Integration Tests

```typescript
// test/integration/auth.test.ts
describe('Authentication Integration', () => {
  test('complete login flow', async () => {
    // Test implementation
  });

  test('protected route access', async () => {
    // Test implementation
  });

  test('role-based access', async () => {
    // Test implementation
  });
});
```

## E2E Tests

```typescript
// e2e/auth.spec.ts
describe('Authentication E2E', () => {
  test('user can log in and access protected routes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

## Test Coverage Requirements

- Minimum 90% coverage for authentication code
- All critical paths must be tested
- Include error cases and edge conditions
- Test both success and failure scenarios
- Test security features thoroughly

## Test Data

```typescript
// test/fixtures/auth.ts
export const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'admin123',
    roles: ['admin'],
  },
  user: {
    email: 'user@example.com',
    password: 'user123',
    roles: ['user'],
  },
};
```

## Running Tests

```bash
# Run all auth tests
pnpm test:auth

# Run with coverage
pnpm test:auth --coverage

# Run E2E tests
pnpm test:e2e
```

## CI/CD Integration

```yaml
# .github/workflows/auth-tests.yml
name: Auth Tests
on:
  push:
    paths:
      - 'middleware.ts'
      - 'pages/api/auth/**'
      - 'lib/auth/**'
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: pnpm install
      - run: pnpm test:auth
```

## Notes

- Always run tests before deployment
- Keep test data isolated
- Mock external services
- Test error handling thoroughly
- Verify security headers
- Test session management
- Include performance tests
- Document test scenarios
