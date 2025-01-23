# TypeScript Guidelines (Updated January 2025)

## Package Versions (January 2025)

For optimal TypeScript development, ensure you're using these minimum versions:

```json
{
  "dependencies": {
    "typescript": "^5.3.3",
    "next": "^14.2.23",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.23",
    "prettier": "^3.4.2"
  }
}
```

## TypeScript Configuration

Our `tsconfig.json` is configured for optimal development with Next.js:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## React Type Best Practices

### Component Types

```typescript
// Import types explicitly
import { type ReactElement, type ReactNode } from 'react'

// Use ReactElement for component return types
export function MyComponent(): ReactElement {
  return <div>Content</div>
}

// Use ReactNode for children props
interface Props {
  children: ReactNode
}
```

### Context Pattern

```typescript
interface ContextType {
  state: State
  dispatch: Dispatch<Action>
}

const MyContext = createContext<ContextType | undefined>(undefined)

export function useMyContext(): ContextType {
  const context = useContext(MyContext)
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider')
  }
  return context
}
```

### Service Pattern

```typescript
interface Service {
  getData: () => Promise<Data>
  updateData: (id: string, data: Partial<Data>) => Promise<Data>
}

export const myService: Service = {
  getData: async () => {
    // Implementation
  },
  updateData: async (id, data) => {
    // Implementation
  },
}
```

## Error Handling

```typescript
try {
  await operation()
} catch (error) {
  logger.error('Operation failed', { error, context: 'operationName' })
  throw new CustomError('Operation failed', { cause: error })
}
```

## Performance Optimization

```typescript
// Use type imports for better tree-shaking
import type { MyType } from './types'

// Use const assertions for literal types
const VALID_STATUSES = ['active', 'inactive'] as const
type Status = (typeof VALID_STATUSES)[number]

// Use Pick and Omit for derived types
type CreateUserDTO = Omit<User, 'id' | 'createdAt'>
type UserSummary = Pick<User, 'id' | 'name' | 'email'>
```

## Latest TypeScript Features

### Using Decorators (Stage 3)

```typescript
@logged
class Service {
  @required
  name: string

  @validate
  async process(@format('json') data: unknown) {
    // Implementation
  }
}
```

### Satisfies Operator

```typescript
const config = {
  api: {
    endpoint: 'https://api.example.com',
    version: 'v1',
  },
  features: {
    darkMode: true,
  },
} satisfies Config
```

### Template Literal Types

```typescript
type Route = `/api/${string}`
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type Endpoint = `${HttpMethod} ${Route}`
```

## Code Organization

- Group imports by type (React, third-party, local)
- Use barrel exports for related functionality
- Keep type definitions close to their usage
- Use type-only imports when possible

## Testing

```typescript
import { type ReactElement } from 'react'
import { render, screen } from '@testing-library/react'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## Documentation

- Use JSDoc for public APIs
- Include type information in comments
- Document complex type relationships
- Keep examples up to date

```typescript
/**
 * Processes user data with validation
 * @param data - The user data to process
 * @returns Processed user data
 * @throws {ValidationError} If data is invalid
 */
async function processUser(data: UserInput): Promise<User> {
  // Implementation
}
```
