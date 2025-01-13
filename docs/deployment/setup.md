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
