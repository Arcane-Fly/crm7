# Error Handling Patterns Guide

## Core Error Handling Patterns

### 1. Component-Level Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/error/ErrorFallback';

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        FallbackComponent={fallback ?? ErrorFallback}
        onReset={() => window.location.reload()}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

### 2. API Error Handling

```typescript
import { useQuery } from '@tanstack/react-query';

export function useApiData<T>(key: string[], fetcher: () => Promise<T>) {
  return useQuery({
    queryKey: key,
    queryFn: fetcher,
    retry: (failureCount, error) => {
      if (error instanceof AuthError) return false;
      return failureCount < 3;
    },
    onError: (error) => {
      // Log error to monitoring service
    },
  });
}
```

### 3. Form Error Handling

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export function useFormWithValidation<T extends object>(
  schema: z.Schema<T>,
  onSubmit: (data: T) => Promise<void>,
) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
  });

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Handle submission errors
      form.setError('root', {
        type: 'submit',
        message: 'Submission failed',
      });
    }
  };

  return { form, handleSubmit };
}
```

## Loading State Patterns

### 1. Loading Indicators

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', sizeClasses[size])}
    >
      {/* Spinner SVG */}
    </div>
  );
}
```

### 2. Skeleton Loading

```typescript
export function SkeletonLoader({ lines = 3 }: { lines?: number }) {
  return (
    <div role="status" aria-label="Loading content">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 h-4 rounded mb-2"
        />
      ))}
    </div>
  );
}
```

## Testing Patterns

### 1. Error Boundary Testing

```typescript
import { render, screen } from '@testing-library/react';

describe('ErrorBoundary', () => {
  it('renders fallback on error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

### 2. API Error Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';

describe('useApiData', () => {
  it('handles API errors correctly', async () => {
    const mockFetcher = jest.fn().mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useApiData(['test'], mockFetcher));

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

## Best Practices

1. **Error Prevention**

   - Use TypeScript for type safety
   - Implement input validation
   - Add proper prop-types
   - Use strict mode

2. **Error Recovery**

   - Implement retry mechanisms
   - Provide clear user feedback
   - Maintain application state
   - Log errors for debugging

3. **Performance**

   - Lazy load error boundaries
   - Optimize error tracking
   - Minimize bundle size
   - Cache error responses

4. **Accessibility**
   - Use ARIA attributes
   - Provide error context
   - Support keyboard navigation
   - Maintain focus management
