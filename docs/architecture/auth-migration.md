# Authentication Migration Guide

## Overview

This guide outlines the process of migrating to the new auth-first implementation, ensuring all routes are properly protected and the authentication page is displayed before accessing any protected content.

## Migration Steps

### 1. Pre-Migration Tasks

```bash
# 1. Backup current configuration
cp middleware.ts middleware.backup.ts
cp .env .env.backup

# 2. Create database backup
pnpm supabase db dump -f pre_auth_migration.sql
```

### 2. Environment Configuration

```env
# .env updates
# Auth0 Configuration
AUTH0_SECRET='your-secret-here'
AUTH0_BASE_URL='https://your-domain.com'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL='your-project-url'
NEXT_PUBLIC_SUPABASE_ANON_KEY='your-anon-key'
SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
```

### 3. Database Schema Updates

```sql
-- migrations/[timestamp]_auth_updates.sql

-- Add sessions table if not exists
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    expires_at timestamptz NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Add role management tables
CREATE TABLE IF NOT EXISTS auth.roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth.user_roles (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid REFERENCES auth.roles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);
```

### 4. Code Updates

#### Update Middleware

```typescript
// middleware.ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  // Implementation from auth.md
}
```

#### Update Navigation Guards

```typescript
// components/navigation/protected-route.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
```

### 5. Client Updates

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Implementation details in auth.md
  }, []);

  return {
    session,
    loading,
    // Other auth utilities
  };
}
```

## Migration Process

### Phase 1: Preparation

1. **Audit Current Auth Usage**

```bash
# Find all auth-related files
find . -type f -exec grep -l "auth" {} \;

# Check for direct session access
grep -r "getSession" .
```

2. **Create Backup Points**

```bash
# Git branch
git checkout -b feat/auth-migration

# Database backup
pnpm supabase db dump
```

### Phase 2: Implementation

1. **Update Dependencies**

```json
{
  "dependencies": {
    "@auth0/nextjs-auth0": "^3.5.0",
    "@supabase/auth-ui-react": "^0.4.7",
    "@supabase/ssr": "^0.1.0"
  }
}
```

2. **Apply Database Migrations**

```bash
pnpm supabase migration up
```

3. **Update Configuration Files**

```bash
# Update next.config.mjs
# Update middleware.ts
# Update environment variables
```

### Phase 3: Testing

1. **Run Migration Tests**

```bash
# Run auth test suite
pnpm test:auth

# Run E2E tests
pnpm test:e2e
```

2. **Verify Security Measures**

```bash
# Security checks
pnpm security-check

# Run penetration tests
pnpm test:security
```

### Phase 4: Deployment

1. **Staging Deployment**

```bash
# Deploy to staging
vercel deploy --staging

# Run smoke tests
pnpm test:smoke
```

2. **Production Deployment**

```bash
# Deploy to production
vercel deploy --prod

# Monitor deployment
pnpm monitor-deployment
```

## Rollback Plan

### Quick Rollback

```bash
# 1. Revert code
git revert HEAD

# 2. Revert database
pnpm supabase db restore pre_auth_migration.sql

# 3. Redeploy
vercel deploy --prod
```

### Manual Rollback Steps

1. Restore middleware.backup.ts
1. Restore .env.backup
1. Revert database changes
1. Clear session data
1. Redeploy application

## Verification Steps

### 1. Authentication Flow

- [ ] Verify login page appears first
- [ ] Test all authentication methods
- [ ] Verify session management
- [ ] Test token refresh flow

### 2. Authorization

- [ ] Verify role-based access
- [ ] Test permission checks
- [ ] Verify API protection
- [ ] Test resource access

### 3. Security

- [ ] Verify CSRF protection
- [ ] Test rate limiting
- [ ] Verify secure headers
- [ ] Test error handling

## Post-Migration Tasks

1. **Cleanup**

```bash
# Remove backup files
rm middleware.backup.ts
rm .env.backup

# Archive old configurations
mkdir -p archive/auth
mv old-auth-configs/* archive/auth/
```

2. **Documentation**

- Update API documentation
- Update security documentation
- Update deployment guides
- Update troubleshooting guides

3. **Monitoring**

- Set up authentication monitoring
- Configure alerts
- Update logging
- Set up audit trails

## Support Plan

### 1. Response Team

- Security Team Lead
- Backend Developer
- DevOps Engineer
- Support Engineer

### 2. Communication Channels

- Slack: #auth-migration
- Email: <auth-support@company.com>
- Emergency: +1-xxx-xxx-xxxx

## Timeline

1. **Week 1**: Preparation

   - Audit and backup
   - Team training
   - Environment setup

2. **Week 2**: Implementation

   - Code updates
   - Database migrations
   - Configuration changes

3. **Week 3**: Testing

   - Unit tests
   - Integration tests
   - Security testing

4. **Week 4**: Deployment
   - Staging deployment
   - Production deployment
   - Monitoring and support

## Notes

- Keep backup of all configurations
- Monitor system closely post-migration
- Have rollback plan ready
- Test in all supported environments
- Document all changes
- Maintain audit trail
