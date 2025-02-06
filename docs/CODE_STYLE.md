# CRM7 Code Style Guide

## Overview

This document outlines the coding standards and best practices for the CRM7 project. Following these guidelines ensures consistency and maintainability across the codebase.

## TypeScript Guidelines

### Type Definitions

```typescript
// ✅ DO: Use explicit type definitions
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ❌ DON'T: Use any
const userData: any = fetchUserData();

// ✅ DO: Use proper typing
const userData: UserProfile = await fetchUserData();
```

### Null Checking

```typescript
// ✅ DO: Use null coalescing and optional chaining
const userName = user?.profile?.name ?? 'Anonymous';

// ❌ DON'T: Use nested ternaries
const userName = user ? (user.profile ? user.profile.name : 'Anonymous') : 'Anonymous';
```

### Type Assertions

```typescript
// ✅ DO: Use as const for readonly arrays
const VALID_STATUSES = ['active', 'inactive', 'pending'] as const;

// ❌ DON'T: Use type assertions without validation
const userData = someData as UserProfile;

// ✅ DO: Validate before assertion
const isUserProfile = (data: unknown): data is UserProfile => {
  return typeof data === 'object' && data !== null && 'id' in data && 'name' in data;
};
```

## React Components

### Functional Components

```typescript
// ✅ DO: Use functional components with proper typing
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
};

// ❌ DON'T: Use class components
class Button extends React.Component {
  // ...
}
```

### Hooks

```typescript
// ✅ DO: Use custom hooks for reusable logic
const useUser = (userId: string) => {
  const { data, error } = useQuery(['user', userId], () => fetchUser(userId));

  return {
    user: data,
    error,
    isLoading: !data && !error,
  };
};

// ❌ DON'T: Repeat complex logic in components
function Component() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setData).catch(setError);
  }, [userId]);
}
```

## Code Organization

### Directory Structure

```
components/
├── ui/                 # Reusable UI components
│   ├── Button/
│   │   ├── index.tsx
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── Input/
├── features/          # Feature-specific components
└── layouts/          # Layout components
```

### File Naming

```
// ✅ DO: Use PascalCase for component files
UserProfile.tsx
LoginForm.tsx

// ✅ DO: Use camelCase for utility files
formatDate.ts
validateEmail.ts

// ✅ DO: Use kebab-case for configuration files
tsconfig.json
.eslintrc.json
```

### Grouping Imports

```typescript
// Group imports by type
import React, { useState } from 'react';  // React core
import { motion } from 'framer-motion';   // Third-party
import { UserProfile } from './types';    // Local types
import { fetchUserData } from './api';    // Local utilities

// Component definition
export const UserCard: React.FC<UserProfile> = ({ name, role }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div>
      <h2>{name}</h2>
      <p>{role}</p>
    </motion.div>
  );
};
```

## Error Handling

```typescript
try {
  const result = await complexOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', { error, context: 'complexOperation' });
  throw new CustomError('Operation failed', { cause: error });
}
```

## Styling

### Tailwind CSS

```typescript
// ✅ DO: Use Tailwind utility classes
const Card: React.FC = ({ children }) => (
  <div className="rounded-lg shadow-md p-4 bg-white">
    {children}
  </div>
);

// ❌ DON'T: Use inline styles
const Card: React.FC = ({ children }) => (
  <div style={{
    borderRadius: '8px',
    padding: '16px'
  }}>
    {children}
  </div>
);
```

### CSS Modules

```typescript
// ✅ DO: Use CSS Modules for complex styling
import styles from './Button.module.css';

const Button: React.FC = ({ children }) => (
  <button className={styles.button}>
    {children}
  </button>
);
```

## Testing

### Unit Tests

```typescript
// ✅ DO: Write descriptive test cases
describe('UserProfile', () => {
  it('should display user name when provided', () => {
    const { getByText } = render(
      <UserProfile name="John Doe" />
    );
    expect(getByText('John Doe')).toBeInTheDocument();
  });

  it('should show placeholder when name is not provided', () => {
    const { getByText } = render(<UserProfile />);
    expect(getByText('Anonymous')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// ✅ DO: Test component integration
describe('LoginForm integration', () => {
  it('should handle successful login', async () => {
    const onSuccess = vi.fn();
    const { getByLabelText, getByRole } = render(
      <LoginForm onSuccess={onSuccess} />
    );

    await userEvent.type(
      getByLabelText('Email'),
      'user@example.com'
    );
    await userEvent.type(
      getByLabelText('Password'),
      'password123'
    );
    await userEvent.click(getByRole('button', { name: 'Login' }));

    expect(onSuccess).toHaveBeenCalled();
  });
});
```

## Documentation

### Component Documentation

```typescript
/**
 * Button component with various styles and states.
 *
 * @param {string} label - The button text
 * @param {() => void} onClick - Click handler
 * @param {'primary' | 'secondary'} [variant='primary'] - Button style variant
 *
 * @example
 * <Button
 *   label="Submit"
 *   onClick={() => console.log('clicked')}
 *   variant="primary"
 * />
 */
```

### Function Documentation

```typescript
/**
 * Formats a date string according to the specified locale.
 *
 * @param {Date} date - The date to format
 * @param {string} [locale='en-US'] - The locale to use for formatting
 * @returns {string} The formatted date string
 *
 * @throws {TypeError} If date is invalid
 *
 * @example
 * formatDate(new Date(), 'en-US')
 * // Returns: "January 22, 2025"
 */
```

## Version Control

### Commit Messages

```
// ✅ DO: Write descriptive commit messages
feat(auth): implement OAuth2 login flow
fix(ui): resolve button alignment in mobile view
docs(api): update authentication documentation

// ❌ DON'T: Write vague commit messages
update code
fix bug
add feature
```

## Performance

### Code Splitting

```typescript
// ✅ DO: Use dynamic imports for large components
const DashboardChart = dynamic(() =>
  import('./DashboardChart'), {
    loading: () => <LoadingSpinner />,
  }
);

// ❌ DON'T: Import large libraries directly
import { Chart } from 'heavy-chart-library';
```

### Memoization

```typescript
// ✅ DO: Memoize expensive calculations
const memoizedValue = useMemo(() => expensiveCalculation(props.data), [props.data]);

// ✅ DO: Memoize callback functions
const memoizedCallback = useCallback(() => handleChange(props.value), [props.value]);
```

## Accessibility

### ARIA Attributes

```typescript
// ✅ DO: Use proper ARIA attributes
<button
  aria-label="Close modal"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  <Icon name="close" />
</button>

// ❌ DON'T: Rely on visual-only indicators
<button onClick={handleClose}>
  <Icon name="close" />
</button>
```

---

Last Updated: 2025-01-22

# Linting Strategy

This document outlines our comprehensive linting and code quality strategy.

## Overview

We employ a multi-layered approach to code quality:

1. Local development checks (pre-commit)
1. CI/CD pipeline validation
1. Configuration synchronization

## Tools

### 1. ESLint

- TypeScript-aware linting
- React best practices
- Security rules
- Accessibility checks
- Import ordering

### 2. Prettier

- Consistent code formatting
- Tailwind CSS class sorting
- Markdown formatting
- JSON/YAML formatting

### 3. Super-linter

- Multi-language validation
- Security scanning
- HTML validation
- Environment file checking

## Pre-commit Hooks

We use `lint-staged` to run checks on staged files:

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "tsc --noEmit",
    "jest --bail --findRelatedTests"
  ]
}
```

This ensures:

- Code is properly formatted
- TypeScript types are valid
- Tests pass for changed files
- ESLint rules are satisfied

## CI/CD Pipeline

Our GitHub Actions workflow uses super-linter to provide comprehensive validation:

- TypeScript/JavaScript linting
- CSS validation
- HTML checking
- Security scanning
- Configuration validation
- Markdown consistency
- YAML/JSON formatting

## Configuration Files

### ESLint (.eslintrc.json)

- Extends multiple configurations
- Includes security plugin
- Custom TypeScript rules
- React-specific settings

### Prettier (.prettierrc.json)

- Project-wide formatting rules
- Tailwind CSS integration
- Consistent quote style
- Proper comma handling

### Markdown (.markdownlint.json)

- Documentation consistency
- Heading structure
- Link validation
- Code block formatting

## Validation Script

We include a configuration validation script (`scripts/validate-configs.ts`) that ensures:

- All required plugins are present
- Configurations are consistent
- Essential rules are enabled

## Best Practices

1. **Always Run Local Checks**

   ```bash
   pnpm lint
   ```

2. **Validate Configuration Changes**

   ```bash
   pnpm validate-configs
   ```

3. **Review CI Results**
   - Check GitHub Actions output
   - Review super-linter findings
   - Address security warnings

## Common Issues and Solutions

### 1. ESLint/Prettier Conflicts

- Prettier takes precedence for formatting
- ESLint handles code quality
- Use `eslint-config-prettier` to avoid conflicts

### 2. TypeScript Strictness

- `strict: true` in tsconfig.json
- Explicit return types
- No unsafe assignments

### 3. Security Considerations

- No eval() or dangerouslySetInnerHTML
- Proper dependency management
- Input validation

## Maintenance

1. **Regular Updates**

   - Keep dependencies current
   - Review new rules
   - Update configurations

2. **Performance Optimization**

   - Use .gitignore and .eslintignore
   - Cache lint results
   - Selective file checking

3. **Documentation**
   - Keep this guide updated
   - Document new rules
   - Explain configuration changes

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
  state: State;
  dispatch: Dispatch<Action>;
}

const MyContext = createContext<ContextType | undefined>(undefined);

export function useMyContext(): ContextType {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}
```

### Service Pattern

```typescript
interface Service {
  getData: () => Promise<Data>;
  updateData: (id: string, data: Partial<Data>) => Promise<Data>;
}

export const myService: Service = {
  getData: async () => {
    // Implementation
  },
  updateData: async (id, data) => {
    // Implementation
  },
};
```

## Error Handling

```typescript
try {
  await operation();
} catch (error) {
  logger.error('Operation failed', { error, context: 'operationName' });
  throw new CustomError('Operation failed', { cause: error });
}
```

## Performance Optimization

```typescript
// Use type imports for better tree-shaking
import type { MyType } from './types';

// Use const assertions for literal types
const VALID_STATUSES = ['active', 'inactive'] as const;
type Status = (typeof VALID_STATUSES)[number];

// Use Pick and Omit for derived types
type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;
```

## Latest TypeScript Features

### Using Decorators (Stage 3)

```typescript
@logged
class Service {
  @required
  name: string;

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
} satisfies Config;
```

### Template Literal Types

```typescript
type Route = `/api/${string}`;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `${HttpMethod} ${Route}`;
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
