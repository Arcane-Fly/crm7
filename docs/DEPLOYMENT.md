# Deployment Guide

## Overview

This guide covers the deployment process for CRM7, including environment setup, build configuration, and monitoring.

## Deployment Environments

### 1. Development

- URL: `https://dev.crm7.example.com`
- Branch: `develop`
- Auto-deploy: Yes
- Environment: Development

### 2. Staging

- URL: `https://staging.crm7.example.com`
- Branch: `staging`
- Auto-deploy: On PR merge
- Environment: Staging

### 3. Production

- URL: `https://crm7.example.com`
- Branch: `main`
- Auto-deploy: Manual trigger
- Environment: Production

## Prerequisites

- Node.js ^18.17.0 (specified in .nvmrc)
- PNPM ^9.0.0 (specified in package.json)
- Vercel CLI
- Access to deployment environments
- Required environment variables

### Version Management

```bash
# Use correct Node version
nvm use

# Verify PNPM version
pnpm --version

# Install dependencies with exact versions
pnpm install --frozen-lockfile
```

## Environment Variables

Create a `.env` file for each environment:

```env
# Next.js
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Authentication
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Feature Flags
NEXT_PUBLIC_FEATURE_FLAGS=
```

## Build Process

### 1. Install Dependencies

```bash
pnpm install
```

### Important Notes
- Do not use --frozen-lockfile flag in Vercel deployment commands
- Ensure pnpm version matches between local and CI environments
- Use COREPACK_DISABLE_SIGNATURES=1 when installing dependencies

### 2. Type Check

```bash
pnpm type-check
```

### 3. Run Tests

```bash
pnpm test
```

### 4. Build Application

```bash
pnpm build
```

### 5. Start Production Server

```bash
pnpm start
```

## Deployment Process

### Using Vercel (Recommended)

1. Connect repository to Vercel:

   ```bash
   vercel link
   ```

2. Deploy to environment:

   ```bash
   # Development
   vercel deploy --env development

   # Staging
   vercel deploy --prod --env staging

   # Production
   vercel deploy --prod
   ```

### Manual Deployment

1. Build the application:

   ```bash
   pnpm build
   ```

2. Deploy build artifacts:

   ```bash
   pnpm deploy
   ```

3. Monitor deployment:

   ```bash
   pnpm deploy:monitor
   ```

## Database Migrations

1. Generate migration:

   ```bash
   pnpm supabase:migration:generate
   ```

2. Apply migration:

   ```bash
   pnpm supabase:migration:up
   ```

3. Verify migration:

   ```bash
   pnpm supabase:migration:status
   ```

## Monitoring & Logging

### 1. Sentry Integration

Monitor application errors:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Performance Monitoring

- Use Vercel Analytics
- Monitor Core Web Vitals
- Track custom metrics

### 3. Log Management

- Application logs: Vercel Logs
- Database logs: Supabase Console
- Error tracking: Sentry

## Security Measures

### 1. SSL Configuration

- Enforce HTTPS
- Configure SSL certificates
- Set up HSTS

### 2. Headers Configuration

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000',
  },
];
```

### 3. Authentication

- Configure Auth0 for each environment
- Set up proper CORS policies
- Implement rate limiting

## Rollback Procedures

### 1. Version Rollback

```bash
# Get deployment history
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-id>
```

### 2. Database Rollback

```bash
# Rollback last migration
pnpm supabase:migration:down

# Rollback to specific version
pnpm supabase:migration:down <version>
```

## Maintenance Mode

Enable maintenance mode when needed:

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Maintenance-Mode',
            value: process.env.MAINTENANCE_MODE || 'false',
          },
        ],
      },
    ];
  },
};
```

## Performance Optimization

### 1. Build Optimization

- Enable compression
- Optimize images
- Implement caching

### 2. Runtime Optimization

- Configure serverless function regions
- Optimize API routes
- Set up CDN caching

## Deployment Checklist

### Pre-deployment

- [ ] Run all tests
- [ ] Check type definitions
- [ ] Verify environment variables
- [ ] Review security headers
- [ ] Check dependencies for vulnerabilities

### Deployment

- [ ] Deploy database migrations
- [ ] Deploy application changes
- [ ] Verify deployment status
- [ ] Check monitoring systems

### Post-deployment

- [ ] Verify application functionality
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Update documentation

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Node.js version
   - Verify dependencies
   - Review build logs

2. **Database Connection Issues**

   - Verify connection strings
   - Check network access
   - Review database logs

3. **Authentication Problems**
   - Verify Auth0 configuration
   - Check callback URLs
   - Review authentication logs

## Contacts

- **DevOps Team**: <devops@crm7.example.com>
- **Security Team**: <security@crm7.example.com>
- **On-call Support**: +1-xxx-xxx-xxxx

---

Last Updated: 2025-01-22
