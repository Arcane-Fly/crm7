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
const userName = user ? user.profile ? user.profile.name : 'Anonymous' : 'Anonymous';
```

### Type Assertions

```typescript
// ✅ DO: Use as const for readonly arrays
const VALID_STATUSES = ['active', 'inactive', 'pending'] as const;

// ❌ DON'T: Use type assertions without validation
const userData = someData as UserProfile;

// ✅ DO: Validate before assertion
const isUserProfile = (data: unknown): data is UserProfile => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
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
  const { data, error } = useQuery(['user', userId], () => 
    fetchUser(userId)
  );

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
    fetchUser(userId)
      .then(setData)
      .catch(setError);
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
const memoizedValue = useMemo(
  () => expensiveCalculation(props.data),
  [props.data]
);

// ✅ DO: Memoize callback functions
const memoizedCallback = useCallback(
  () => handleChange(props.value),
  [props.value]
);
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
