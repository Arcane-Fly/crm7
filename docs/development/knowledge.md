# Development Knowledge Base

## Core Principles

### Error Handling

- Never swallow errors
- Use error boundaries at both global and component levels
- Log all errors with context
- Provide user-friendly error messages
- Use try/catch with proper error typing

### Logging

- Log all API endpoints and services
- Include request context and timing
- Use appropriate log levels (debug, info, warn, error)
- Add performance metrics for critical paths
- Monitor error rates and patterns

### Type Safety

- Use TypeScript strict mode
- Add runtime validation for external data
- Use type guards for complex logic
- Keep type definitions up to date
- Validate API payloads with Zod

### Testing

- Maintain >80% test coverage
- Write tests for error cases
- Include visual regression tests
- Add performance benchmarks
- Test accessibility compliance

### Performance

- Monitor bundle size (<200KB initial JS)
- Use code splitting and lazy loading
- Optimize images and assets
- Track web vitals
- Profile database queries

### Security

- Sanitize user input
- Regular dependency audits
- Secure environment variables
- Follow OWASP guidelines
- Implement proper CORS policies

## Quick References

### Useful Commands

```bash
# Run all checks
pnpm lint && pnpm type-check && pnpm test

# Build and analyze bundle
pnpm build && pnpm analyze

# Run security audit
pnpm audit
```

### Build Configuration
- Use `packageManager` field in package.json when using pnpm
- Specify exact pnpm version to avoid engine compatibility issues
- Remove loading prop from DataTable component as it's not supported

### Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Web Vitals](https://web.dev/vitals/)
