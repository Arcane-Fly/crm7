# Project Configuration

## Version Requirements

- Next.js version: 15.1.6 (required)
- Node.js: ^18.17.0
- TypeScript: ^5.0.0
- Package manager: pnpm (version 10.2.1)

## Project Path

- Project must be initialized with correct base path: /home/braden/Desktop/Dev/crm7r
- All file access and operations must be relative to this path
- Project is part of the Desktop/Dev directory containing multiple projects

## Build Tools

- Uses Next.js for development and production builds
- Package manager: pnpm (version 10.2.1)
- Node version: ^18.17.0

## Version Management

### Next.js 15.1.6 Features

- Uses modern image optimization with remotePatterns
- Enables optimized package imports for better performance
- Supports modern CSS features with modernBrowsers flag
- Implements incremental TypeScript checking
- Enhanced security headers configuration
- Improved server actions with origin validation

### Version Control

- Check Next.js version staleness warnings
- Monitor Next.js releases for security updates
- Test shadcn/ui and Lucide React compatibility with each upgrade
- Run comprehensive tests after version updates
- Use canary releases when reporting bugs or testing cutting-edge features
- Reference: <https://nextjs.org/docs/messages/version-staleness>

### Compatibility Notes

- All @radix-ui components are optimized for tree-shaking
- Lucide React icons are bundled efficiently
- Server actions are properly typed and validated
- Security headers are automatically applied
- Image optimization uses modern patterns
- TypeScript strict mode is enforced

### Development Guidelines

- Use server actions with proper origin validation
- Implement proper error boundaries for async components
- Follow Next.js App Router best practices
- Use modern image optimization patterns
- Implement proper security headers
- Monitor bundle size with built-in analyzer

### Testing Requirements

- Run full test suite before version updates
- Test server actions in development and production
- Verify image optimization with different devices
- Check bundle size changes after updates
- Validate security headers in production
- Test canary releases when needed

### Supabase Integration

- Use @supabase/ssr for server-side rendering
- Implement createServerClient for server components
- Use createBrowserClient for client components
- Local development requires Docker and Supabase CLI
- Enforce type safety with generated types
- Reference: <https://supabase.com/docs/guides/local-development>

### Route Handler Requirements

- Route handlers must use typed params interface
- Context params are no longer Promise types in App Router
- Route handler functions must be async
- Route handlers should use NextRequest type
- Each route file should export a single HTTP method handler

## Package Management

- Use pnpm as the package manager
- Version: 10.2.1
- No npm lock files allowed
- Use .npmrc for configuration
- Use pnpm-lock.yaml for dependency locking
- Use `engine-strict=true` for Node version enforcement
