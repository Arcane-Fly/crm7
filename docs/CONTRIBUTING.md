# Contributing Guide

## Development Setup

### Prerequisites

- Node.js (v20.x or higher)
- PNPM (v8.x or higher)
- TypeScript (v5.x)

### Getting Started

1. Clone the repository
2. Run `pnpm install`
3. Copy `.env.example` to `.env` and configure environment variables
4. Run `pnpm dev` to start development server

## Code Style & Standards

### TypeScript Guidelines

- Use strict mode (`"strict": true`)
- Prefer type inference where possible
- Use explicit return types for public APIs
- Follow [TypeScript's Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Follow React Query patterns for data fetching
- Use proper ARIA attributes for accessibility

### File Structure

```text
src/
  components/     # Reusable UI components
  features/       # Feature-specific components
  hooks/         # Custom React hooks
  api/           # API integration
  types/         # TypeScript types/interfaces
  utils/         # Utility functions
  styles/        # Global styles and themes
```

### Naming Conventions

- Components: `PascalCase`
- Functions/Variables: `camelCase`
- Constants: `UPPERCASE_SNAKE_CASE`
- Files: Match the exported component name

## Testing

- Write unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for critical user flows
- E2E tests for core functionality

## Documentation

- Use TSDoc comments for components and functions
- Keep README.md up to date
- Document API changes
- Include usage examples

## Git Workflow

1. Create feature branch from `main`
2. Make changes and commit using conventional commits
3. Write tests and update documentation
4. Submit PR with description of changes
5. Address review comments
6. Squash and merge

## Performance

- Use React.memo() for expensive computations
- Implement code splitting with React.lazy()
- Optimize bundle size
- Monitor and improve Core Web Vitals

## Accessibility

- Follow WCAG 2.1 guidelines
- Use semantic HTML
- Implement keyboard navigation
- Test with screen readers

## Security

- Implement input validation
- Use HTTPS
- Follow OWASP guidelines
- Regular dependency updates

## Deployment

- CI/CD pipeline checks
- Staging environment testing
- Production deployment process
- Monitoring and logging

For detailed information about specific topics, refer to the respective documentation in the `/docs` directory.
