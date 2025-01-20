# TypeScript Guidelines

## Type Definitions

### Component Props

```typescript
interface ComponentProps {
  /** Description of the prop */
  propName: PropType
}

// Example
interface ButtonProps {
  /** The text content of the button */
  label: string
  /** Optional click handler */
  onClick?: () => void
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost'
}
```

### Custom Hooks

```typescript
function useCustomHook<T>(param: T): [T, (value: T) => void] {
  // Implementation
}
```

### API Types

```typescript
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

interface ErrorResponse {
  error: string
  code: number
}
```

## Best Practices

### Type Inference

- Let TypeScript infer types when obvious
- Explicitly type complex objects and functions
- Use `const` assertions for literal types

### Generic Types

- Use meaningful type parameter names
- Constrain generics when possible
- Document generic parameters

### Type Guards

```typescript
function isError(value: unknown): value is Error {
  return value instanceof Error
}
```

### Utility Types

- Use built-in utility types (Partial, Pick, etc.)
- Create custom utility types for reusability
- Document complex type transformations

### Async Code

```typescript
async function fetchData<T>(): Promise<T> {
  try {
    const response = await api.get<T>('/endpoint')
    return response.data
  } catch (error) {
    if (isError(error)) {
      throw new Error(`Failed to fetch: ${error.message}`)
    }
    throw error
  }
}
```

## React Integration

### Function Components

```typescript
const Component: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};
```

### Event Handlers

```typescript
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // Implementation
}
```

### Context

```typescript
interface ContextType {
  value: string
  setValue: (value: string) => void
}

const Context = React.createContext<ContextType | undefined>(undefined)
```

### Custom Hooks

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  // Implementation
}
```

## Type Safety

### Strict Mode

- Enable strict mode in tsconfig.json
- Use strict null checks
- Enable noImplicitAny

### Type Assertions

- Minimize use of type assertions
- Use `as const` for literal types
- Prefer type guards over assertions

### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  if (error instanceof CustomError) {
    // Handle specific error
  } else {
    // Handle unknown error
  }
}
```

## Tools and Configuration

### ESLint

- Use @typescript-eslint
- Enable strict rules
- Configure import sorting

### Prettier

- Use consistent formatting
- Configure for TypeScript

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
