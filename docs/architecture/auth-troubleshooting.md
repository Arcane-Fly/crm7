# Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. Login Page Not Appearing First

#### Symptoms

- Users can access protected routes without authentication
- No redirect to login page
- Inconsistent authentication behavior

#### Possible Causes

1. Middleware configuration

```typescript
// Check middleware.ts
const publicRoutes = ['/login', '/api/auth']; // Too permissive?
const isPublicRoute = path.startsWith(...publicRoutes); // Incorrect check?
```

2. Route configuration

```typescript
// Check next.config.mjs
const config = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
    ];
  },
};
```

#### Solutions

1. Verify middleware configuration:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Ensure strict public route checking
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );

  if (!isPublicRoute) {
    // Check authentication
    const session = await getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}
```

2. Check environment variables:

```bash
# Verify auth configuration
echo $AUTH0_BASE_URL
echo $NEXT_PUBLIC_SUPABASE_URL
```

### 2. Session Management Issues

#### Symptoms

- Frequent logouts
- Session not persisting
- Token refresh failures

#### Diagnostic Steps

1. Check browser storage:

```javascript
// Browser Console
localStorage.getItem('supabase.auth.token');
document.cookie; // Check auth cookies
```

2. Verify cookie settings:

```typescript
// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
};
```

#### Session Solutions

1. Update cookie settings:

```typescript
// auth/session.ts
export function setAuthCookie(res: NextApiResponse, session: Session) {
  res.setHeader(
    'Set-Cookie',
    serialize('auth-token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    }),
  );
}
```

2. Implement session refresh:

```typescript
// hooks/useAuth.ts
useEffect(() => {
  const refreshSession = async () => {
    if (session?.expires_at && Date.now() > session.expires_at - 5 * 60 * 1000) {
      await refreshToken();
    }
  };

  const interval = setInterval(refreshSession, 60 * 1000);
  return () => clearInterval(interval);
}, [session]);
```

### 3. Role-Based Access Issues

#### Symptoms

- Unauthorized access errors
- Incorrect role assignments
- Missing permissions

#### Role Diagnostic Steps

1. Check user roles:

```typescript
// Debug user roles
console.log('User session:', await getSession());
console.log('User roles:', session?.user?.['https://app.com/roles']);
```

2. Verify role configuration:

```typescript
// Check role definitions
const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
} as const;

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['read:all', 'write:all'],
  [ROLES.USER]: ['read:own', 'write:own'],
  [ROLES.GUEST]: ['read:public'],
} as const;
```

#### Role Management Solutions

1. Update role checks:

```typescript
// utils/auth.ts
export function hasPermission(user: User, requiredPermission: string): boolean {
  const userRoles = user?.roles || [];
  const userPermissions = userRoles.flatMap((role) => ROLE_PERMISSIONS[role] || []);
  return userPermissions.includes(requiredPermission);
}
```

2. Implement role synchronization:

```typescript
// services/auth.ts
async function syncUserRoles(userId: string) {
  const auth0Roles = await getAuth0Roles(userId);
  await supabase.from('user_roles').upsert({ user_id: userId, roles: auth0Roles });
}
```

### 4. API Authentication Failures

#### Symptoms

- 401 Unauthorized errors
- Token validation failures
- API requests failing

#### API Diagnostic Steps

1. Check request headers:

```typescript
// Debug request headers
console.log('Authorization:', req.headers.authorization);
console.log('Cookie:', req.headers.cookie);
```

2. Verify token format:

```typescript
// Debug token
const token = req.headers.authorization?.split(' ')[1];
try {
  const decoded = jwt.decode(token);
  console.log('Decoded token:', decoded);
} catch (error) {
  console.error('Token decode error:', error);
}
```

#### API Authentication Solutions

1. Update token validation:

```typescript
// middleware/validateToken.ts
export async function validateToken(req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');

    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

2. Implement token refresh:

```typescript
// utils/api-client.ts
async function refreshTokenIfNeeded() {
  const token = getStoredToken();
  if (isTokenExpired(token)) {
    const newToken = await refreshAuthToken();
    setStoredToken(newToken);
    return newToken;
  }
  return token;
}
```

### 5. Performance Issues

#### Symptoms

- Slow login process
- Delayed redirects
- High latency in protected routes

#### Performance Diagnostic Steps

1. Check authentication timing:

```typescript
// monitoring/auth-metrics.ts
const startTime = performance.now();
await authenticateUser();
const duration = performance.now() - startTime;
console.log('Authentication duration:', duration);
```

2. Monitor token operations:

```typescript
// Monitor token verification time
const tokenMetrics = {
  verificationTime: [],
  refreshTime: [],
  failures: 0,
};
```

#### Performance Optimization Solutions

1. Implement caching:

```typescript
// utils/auth-cache.ts
const tokenCache = new Map<
  string,
  {
    token: string;
    expires: number;
  }
>();

export function getCachedToken(key: string): string | null {
  const cached = tokenCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.token;
  }
  return null;
}
```

2. Optimize token validation:

```typescript
// services/auth.ts
const memoizedValidateToken = memoize(
  validateToken,
  { maxAge: 60 * 1000 }, // Cache for 1 minute
);
```

## Monitoring and Debugging

### Debug Logging Setup

```bash
# Enable debug logging
export DEBUG=auth:*
export LOG_LEVEL=debug
```

### Authentication Metrics Collection

```typescript
// Monitor authentication metrics
const authMetrics = {
  loginAttempts: 0,
  successfulLogins: 0,
  failedLogins: 0,
  tokenRefreshes: 0,
  averageLoginTime: 0,
};
```

### Alert System Configuration

```typescript
// Alert on authentication issues
function alertOnAuthIssues(metric: keyof typeof authMetrics) {
  if (authMetrics[metric] > ALERT_THRESHOLDS[metric]) {
    notifyTeam('auth-alert', {
      metric,
      value: authMetrics[metric],
      timestamp: new Date(),
    });
  }
}
```

## Emergency Procedures

### Emergency Auth Disable

```typescript
// DANGER: Use only in emergencies
export function disableAuth(reason: string) {
  logger.warn('Disabling authentication', { reason });
  process.env.DISABLE_AUTH = 'true';
  // Notify security team
  notifySecurityTeam('auth-disabled', { reason });
}
```

### Emergency Session Reset Procedure

```typescript
// Reset all sessions
async function resetAllSessions() {
  await supabase.from('sessions').delete().neq('id', 0);
  // Force all users to re-login
}
```

## Contact Information

- Security Team: <security@company.com>
- Auth0 Support: <support@auth0.com>
- Supabase Support: <support@supabase.io>
- On-call Engineer: +1-xxx-xxx-xxxx

## Additional Resources

- [Auth0 Debugging Guide](https://auth0.com/docs/troubleshoot)
- [Supabase Troubleshooting](https://supabase.com/docs/support)
- [NextAuth Documentation](https://next-auth.js.org/getting-started/introduction)
- Internal Wiki: <https://wiki.company.com/auth-troubleshooting>
