# Development Guidelines

## Version Requirements

- Next.js version: 15.1.6 (required)
- Node.js: ^18.17.0
- TypeScript: ^5.0.0

## Next.js 15.1.6 Best Practices

### Server Components
- Use Server Components by default
- Only use Client Components when needed for interactivity
- Leverage async components for data fetching
- Implement proper error boundaries
- Use suspense boundaries for loading states

### Server Actions
- Validate origins in server actions
- Use proper form validation
- Implement optimistic updates
- Handle errors gracefully
- Use proper typing for form data

### Image Optimization
- Use remotePatterns for external images
- Implement proper loading strategies
- Use responsive image sizes
- Optimize image quality
- Implement blur placeholders

### Security
- Use security headers
- Implement CORS properly
- Validate all user input
- Use proper CSP headers
- Monitor security updates

## Type Safety

### CSS Modules
- Create .d.ts files for CSS modules to properly type style imports
- Use readonly array syntax for style properties
- Access styles with bracket notation: styles['propertyName']

### Environment Variables
- Access process.env with bracket notation: process.env['VARIABLE_NAME']
- Add types to global.d.ts for all environment variables
- Validate environment variables at startup

### Component Props
- Always define explicit interfaces for component props
- Return React.ReactElement from components
- Use proper generics for data table and form components
- Remove void return types from React components
- Use satisfies operator for constant objects that need type inference

### API Routes
- Use NextResponse for all API route returns
- Type API responses with proper generics
- Handle undefined environment variables explicitly
- Use satisfies operator for auth options to preserve type inference

### Navigation
- Type all navigation items with proper interfaces
- Use type guards for dynamic navigation structures
- Validate navigation item structure at runtime
- Define navigation constants with Record<string, NavSection> type

### Error Handling
- Create custom error classes that extend Error
- Add proper type context to error details
- Use instanceof checks for error type guards
- Log errors with proper context and typing

### Git Workflow
- Use --no-verify flag to bypass pre-commit hooks if lint-staged configuration fails
- Ensure commit messages follow conventional commits format
- Keep commits focused on single concerns
- When pushing changes: commit, pull with rebase, then push
- Use conventional commit prefixes: feat, fix, docs, style, refactor, test, chore

### Performance
- Use optimized package imports
- Enable modern browser features
- Monitor bundle sizes
- Use proper caching strategies
- Implement proper code splitting
