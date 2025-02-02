# Deployment Setup Guide

## Vercel Deployment

### Prerequisites

- Node.js 18+
- Vercel CLI
- Supabase account
- Environment variables configured

### Environment Variables

```env
# Authentication
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# API Keys
FAIRWORK_API_KEY=
GROQ_API_KEY=
PERPLEXITY_API_KEY=

# Storage
BLOB_READ_WRITE_TOKEN=

# External Services
GOVERNMENT_PORTAL_URL=
RTO_API_ENDPOINT=
PAYROLL_API_ENDPOINT=
```

### Deployment Steps

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Link project:

   ```bash
   vercel link
   ```

3. Deploy:

   ```bash
   vercel deploy --prod
   ```

### CI/CD Pipeline

- GitHub Actions workflow
- Automated testing
- Preview deployments
- Production deployments

### Monitoring

- Vercel Analytics
- Error tracking
- Performance monitoring
- Usage analytics

### Deployment Webhook

- Use the deployment webhook URL format: `https://api.vercel.com/v1/integrations/deploy/{PROJECT_ID}/{DEPLOY_HOOK}`
- After triggering deployment, wait a few seconds before checking status
- Use v13 API for deployment status checks: `https://api.vercel.com/v13/deployments/{DEPLOYMENT_ID}`
- Always include Authorization header with Vercel token for status checks

### Production Optimizations

1. Enable Edge Runtime:

   ```json
   {
     "runtime": "edge",
     "regions": ["syd1", "sin1"]
   }
   ```

2. Configure Build Cache:

   ```bash
   vercel deploy --prod --build-cache
   ```

3. Enable Prerender:

   ```typescript
   export const runtime = 'edge';
   export const preferredRegion = ['syd1', 'sin1'];
   export const dynamic = 'force-static';
   ```

### Monitoring Setup

1. Configure Sentry:

   ```bash
   vercel integrations add sentry
   ```

2. Enable Performance Monitoring:

   ```bash
   vercel env add NEXT_PUBLIC_ENABLE_MONITORING production
   ```

3. Setup Status Checks:

   ```bash
   vercel status-checks add "TypeScript" "pnpm run type-check"
   vercel status-checks add "Tests" "pnpm run test"
   vercel status-checks add "Lint" "pnpm run lint"
   ```
