# Auth0 APIs Documentation

Auth0 provides several APIs that enable you to manage users, applications, and your Auth0 tenant programmatically. This documentation covers the main APIs and their use cases.

## Available APIs

1. **Authentication API**
   - User authentication and authorization
   - Token management
   - Multi-factor authentication operations

2. **Management API**
   - Tenant configuration
   - User management
   - Application management
   - Connection management

3. **Deploy CLI API**
   - Infrastructure as code
   - Tenant automation
   - Configuration management

## Authentication API

The Authentication API is the primary interface for handling user authentication flows.

### Key Features

- User login and signup
- Password reset flows
- MFA operations
- Token operations (refresh, revoke)
- User profile management

### Common Operations

```typescript
// Login example using fetch
const login = async (email: string, password: string) => {
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'password',
      username: email,
      password,
      client_id: clientId,
      scope: 'openid profile email'
    })
  });
  return response.json();
};

// Sign up example
const signup = async (email: string, password: string) => {
  const response = await fetch(`https://${domain}/dbconnections/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      email,
      password,
      connection: 'Username-Password-Authentication'
    })
  });
  return response.json();
};
```

### Authentication Endpoints

| Endpoint | Description |
|----------|-------------|
| `/oauth/token` | Get tokens |
| `/oauth/revoke` | Revoke refresh tokens |
| `/userinfo` | Get user profile |
| `/dbconnections/signup` | User signup |
| `/dbconnections/change_password` | Password reset |

## Management API

The Management API provides programmatic access to manage all aspects of your Auth0 tenant.

### Key Features

- User CRUD operations
- Role and permission management
- Client application management
- Connection configuration
- Rules and hooks management

### Authentication

The Management API requires an access token with appropriate scopes:

```typescript
const getManagementApiToken = async () => {
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials'
    })
  });
  return response.json();
};
```

### Common Operations

```typescript
// Get users example
const getUsers = async (accessToken: string) => {
  const response = await fetch(`https://${domain}/api/v2/users`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Create user example
const createUser = async (accessToken: string, userData: any) => {
  const response = await fetch(`https://${domain}/api/v2/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};
```

## Best Practices

### Rate Limiting

- Implement exponential backoff
- Cache responses when possible
- Use bulk operations when available

### Security

1. **Token Management**
   - Store tokens securely
   - Implement proper token rotation
   - Use appropriate token lifetimes

2. **Scope Management**
   - Request minimal required scopes
   - Regularly audit granted permissions
   - Use separate clients for different operations

### Error Handling

```typescript
const handleAuth0Error = (error: any) => {
  if (error.error === 'invalid_grant') {
    // Handle invalid credentials
  } else if (error.error === 'too_many_attempts') {
    // Handle rate limiting
  } else {
    // Handle other errors
  }
};
```

## SDK Integration

Auth0 provides official SDKs for various platforms:

```typescript
// React example using @auth0/auth0-react
import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={() => loginWithRedirect()}>Log In</button>;
}
```

## Additional Resources

- [Auth0 Authentication API Documentation](https://auth0.com/docs/api/authentication)
- [Auth0 Management API Documentation](https://auth0.com/docs/api/management/v2)
- [Auth0 SDKs](https://auth0.com/docs/libraries)
- [Auth0 Deploy CLI Documentation](./deploy-cli/README.md)

## Comprehensive Auth0 Integration Guide with Port 4200

### Overview

This application uses Auth0 for authentication and authorization, integrated with Supabase for additional database features and Row Level Security (RLS).

### Configuration

#### Auth0 Setup

1. Create an Auth0 application in your [Auth0 Dashboard](https://manage.auth0.com/)
2. Configure the following URLs in your Auth0 application settings:
   ```
   Allowed Callback URLs: http://localhost:4200/api/auth/callback
   Allowed Logout URLs: http://localhost:4200
   ```

3. Set up the following environment variables:
   ```bash
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_CLIENT_SECRET=your_client_secret
   AUTH0_ADMIN_API_KEY=https://dev-rkchrceel6xwqe2g.us.auth0.com/api/v2/
   NEXT_PUBLIC_BASE_URL=http://localhost:4200
   ```

#### Supabase Integration

The application uses both Auth0 and Supabase for authentication:

1. Auth0 handles:
   - Social logins
   - Enterprise SSO
   - Multi-factor authentication
   - Password policies

2. Supabase handles:
   - Database authentication
   - Row Level Security (RLS)
   - Data access control
   - API authorization

### Development

1. Start the development server:
   ```bash
   pnpm dev --port 4200
   ```

2. Access the application at `http://localhost:4200`

### Authentication Flow

1. User clicks "Continue with Auth0" on the login page
2. User is redirected to Auth0's login page
3. After successful authentication, user is redirected back to the callback URL
4. The application verifies the Auth0 token and creates a session
5. User is redirected to the dashboard

### Security Considerations

1. **Environment Variables**
   - Never commit sensitive credentials to version control
   - Use different Auth0 applications for development and production

2. **API Security**
   - All API routes are protected by authentication middleware
   - Database access is controlled by RLS policies
   - JWT tokens are validated on every request

3. **Session Management**
   - Sessions expire after 24 hours
   - Refresh tokens are rotated for security
   - Logout invalidates all active sessions

### Deployment

1. Update environment variables for production:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
   ```

2. Update Auth0 application settings:
   ```
   Allowed Callback URLs: https://your-production-domain.com/api/auth/callback
   Allowed Logout URLs: https://your-production-domain.com
   ```

3. Deploy your application using Vercel or your preferred hosting provider

### Troubleshooting

1. **Login Issues**
   - Check Auth0 configuration in Auth0 Dashboard
   - Verify environment variables are set correctly
   - Check browser console for errors
   - Verify callback URLs match exactly

2. **API Access Issues**
   - Check JWT token in browser storage
   - Verify API routes are properly protected
   - Check RLS policies in Supabase

### Additional Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Authentication Guide](https://nextjs.org/docs/authentication)
- [Auth0 Deploy CLI Documentation](./deploy-cli/README.md)
