# Development Guidelines

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
- If lint-staged fails due to configuration issues, use git commit --no-verify
- Changes should be made through pull requests, though direct pushes are possible

