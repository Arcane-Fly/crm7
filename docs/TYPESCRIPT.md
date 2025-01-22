# TypeScript Guidelines (Updated January 2025)

[Previous content remains the same as it's already up to date with current best practices]

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

## Latest TypeScript Features (5.3+)

### Using Decorators

```typescript
// Class decorator
function logged(target: typeof BaseService) {
  return class extends target {
    constructor(...args: any[]) {
      super(...args)
      console.log(`Created instance of ${target.name}`)
    }
  }
}

// Property decorator
function required(target: object, propertyKey: string) {
  let value: any

  const getter = () => value
  const setter = (newValue: any) => {
    if (newValue === undefined || newValue === null) {
      throw new Error(`${propertyKey} is required`)
    }
    value = newValue
  }

  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true,
  })
}

@logged
class BaseService {
  @required
  name: string

  constructor(name: string) {
    this.name = name
  }
}
```

### Using 'using' Declarations

```typescript
class Resource {
  [Symbol.dispose]() {
    // Cleanup logic
  }
}

function processResource() {
  using resource = new Resource()
  // Resource will be automatically disposed
}
```

### Improved Type Inference

```typescript
// Better inference for array methods
const numbers = [1, 2, 3] as const
const doubled = numbers.map((n) => n * 2)
// Type is: number[]

// Improved tuple types
function tuple<T extends unknown[]>(...args: T): T {
  return args
}
const t = tuple(1, 'hello', true)
// Type is: [number, string, boolean]
```

### Enhanced Type Narrowing

```typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript knows value is string here
    console.log(value.toUpperCase())
  } else {
    // TypeScript knows value is number here
    console.log(value.toFixed(2))
  }
}

// Discriminated unions with 'satisfies'
const config = {
  api: {
    endpoint: 'https://api.example.com',
    version: 'v1',
  },
  features: {
    darkMode: true,
    analytics: false,
  },
} satisfies {
  api: Record<string, string>
  features: Record<string, boolean>
}
```

[Rest of the document remains the same]
