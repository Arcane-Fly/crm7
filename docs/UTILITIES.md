# Utilities Documentation

This document outlines the shared utilities available in the application.

## Table of Contents

1. [API Utilities](#api-utilities)
2. [Async Operations](#async-operations)
3. [Performance Utilities](#performance-utilities)
4. [Logging](#logging)
5. [Validation](#validation)

## API Utilities

Located in `lib/utils/api.ts`, these utilities provide standardized API handling:

```typescript
import { createApiHandler } from '@/lib/utils/api';

export const handler = createApiHandler({
  schema: userSchema,
  handler: async (data) => {
    // Handle request
  },
  cacheControl: {
    maxAge: 3600,
  },
});
```

Features:

- Request validation
- Error handling
- Rate limiting
- Caching
- Logging

## Async Operations

Located in `lib/hooks/useAsync.ts`, this hook manages async operations:

```typescript
const { data, isLoading, error } = useAsync(fetchData, {
  autoExecute: true,
  retryCount: 3,
  toastOnError: true,
});
```

Features:

- Loading states
- Error handling
- Automatic retries
- Toast notifications
- Success/error callbacks

## Performance Utilities

Located in `lib/utils/performance.ts`, these utilities help optimize performance:

```typescript
// Debounce function calls
const debouncedSearch = debounce(searchFunction, 300);

// Monitor render times
useRenderTime('ComponentName');

// Detect expensive re-renders
useRenderOptimization('ComponentName', props);

// Optimize for visibility
useVisibilityOptimization(() => {
  // Suspend operations when tab is hidden
});
```

Features:

- Debounce/throttle functions
- Render time monitoring
- Re-render optimization
- Tab visibility optimization
- API call performance tracking

## Logging

Located in `lib/utils/logger.ts`, provides structured logging:

```typescript
const logger = createLogger('ComponentName');

logger.info('Operation successful', { userId: 123 });
logger.error('Operation failed', { error });

// Create child logger
const childLogger = logger.extend('SubComponent');
```

Features:

- Named loggers
- Log levels
- Structured context
- Production error reporting
- Child loggers

## Validation

Located in `lib/utils/validation.ts`, provides common validation schemas:

```typescript
import { emailSchema, passwordSchema, addressSchema, validateSchema } from '@/lib/utils/validation';

// Validate data
const result = validateSchema(emailSchema, userEmail);
if (!result.success) {
  const errors = getValidationErrors(result.errors);
}
```

Available Schemas:

- Email validation
- Password requirements
- Phone numbers (E.164 format)
- Dates
- URLs
- ABN (Australian Business Number)
- TFN (Tax File Number)
- Addresses
- Person names

Helper Functions:

- `validateSchema`: Safe schema validation
- `getValidationErrors`: Format validation errors
- `validateABN`: ABN validation
- `validateTFN`: TFN validation

## Best Practices

1. **API Development**

   - Always use `createApiHandler` for API routes
   - Include proper validation schemas
   - Configure appropriate caching
   - Handle errors consistently

2. **Async Operations**

   - Use `useAsync` for complex operations
   - Configure retry strategies
   - Provide meaningful error messages
   - Implement loading states

3. **Performance**

   - Use debounce/throttle for frequent events
   - Monitor component render times
   - Optimize expensive operations
   - Implement proper caching

4. **Logging**

   - Use structured logging
   - Include relevant context
   - Use appropriate log levels
   - Create child loggers for components

5. **Validation**
   - Use predefined schemas when possible
   - Validate data early
   - Provide clear error messages
   - Handle validation errors gracefully

## Examples

### Complete API Endpoint

```typescript
import { createApiHandler } from '@/lib/utils/api';
import { personNameSchema } from '@/lib/utils/validation';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('user-api');

export const handler = createApiHandler({
  schema: personNameSchema,
  handler: async (data) => {
    logger.info('Creating user', { data });

    try {
      const user = await createUser(data);
      logger.info('User created', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error });
      throw error;
    }
  },
  cacheControl: {
    maxAge: 0, // Don't cache POST requests
  },
});
```

### Optimized Component

```typescript
import { useAsync } from '@/lib/hooks/useAsync';
import { useRenderOptimization } from '@/lib/utils/performance';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('UserProfile');

function UserProfile({ userId }: { userId: string }) {
  useRenderOptimization('UserProfile', { userId });

  const { data, isLoading, error } = useAsync(
    () => fetchUserProfile(userId),
    {
      autoExecute: true,
      retryCount: 3,
      onSuccess: (data) => {
        logger.info('Profile loaded', { userId });
      },
      onError: (error) => {
        logger.error('Failed to load profile', { userId, error });
      }
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ProfileDisplay data={data} />;
}
```
