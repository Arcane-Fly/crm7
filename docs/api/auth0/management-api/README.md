# Auth0 Management API v2 Documentation

The Auth0 Management APIv2 provides programmatic access to manage all aspects of your Auth0 tenant. This RESTful API enables you to automate tenant configuration, manage users, and handle various Auth0 resources.

## Authentication

### Getting an Access Token

Before using the Management API, you need to obtain an access token:

```typescript
const getToken = async () => {
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

## API Endpoints

### Users

#### List Users
```http
GET https://{tenant}.auth0.com/api/v2/users
```

Parameters:
- `q`: Search query
- `search_engine`: Search engine version
- `page`: Page number
- `per_page`: Items per page
- `include_totals`: Include total count
- `sort`: Sort field and order

#### Create User
```http
POST https://{tenant}.auth0.com/api/v2/users
```

```json
{
  "email": "user@example.com",
  "email_verified": false,
  "name": "John Doe",
  "connection": "Username-Password-Authentication",
  "password": "secret-password"
}
```

#### Update User
```http
PATCH https://{tenant}.auth0.com/api/v2/users/{id}
```

#### Delete User
```http
DELETE https://{tenant}.auth0.com/api/v2/users/{id}
```

### Roles

#### List Roles
```http
GET https://{tenant}.auth0.com/api/v2/roles
```

#### Create Role
```http
POST https://{tenant}.auth0.com/api/v2/roles
```

```json
{
  "name": "admin",
  "description": "Administrator role"
}
```

#### Assign Role to User
```http
POST https://{tenant}.auth0.com/api/v2/users/{id}/roles
```

### Applications (Clients)

#### List Applications
```http
GET https://{tenant}.auth0.com/api/v2/clients
```

#### Create Application
```http
POST https://{tenant}.auth0.com/api/v2/clients
```

```json
{
  "name": "My Application",
  "description": "My Application Description",
  "callbacks": ["http://localhost:3000/callback"],
  "allowed_logout_urls": ["http://localhost:3000"],
  "allowed_origins": ["http://localhost:3000"]
}
```

### Connections

#### List Connections
```http
GET https://{tenant}.auth0.com/api/v2/connections
```

#### Create Connection
```http
POST https://{tenant}.auth0.com/api/v2/connections
```

```json
{
  "name": "my-db-connection",
  "strategy": "auth0",
  "enabled_clients": ["client_id1", "client_id2"]
}
```

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "forbidden",
  "error_description": "Access denied.",
  "message": "The access token does not contain the required scopes"
}
```

## Rate Limiting

The Management API implements rate limiting with the following headers:

- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time in Unix epoch seconds

Example implementation:

```typescript
const handleRateLimit = (headers: Headers) => {
  const limit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');

  if (remaining === '0') {
    const waitTime = parseInt(reset || '0') * 1000 - Date.now();
    return new Promise(resolve => setTimeout(resolve, waitTime));
  }
};
```

## Pagination

Most endpoints that return arrays support pagination:

```typescript
const getAllUsers = async (accessToken: string) => {
  let users = [];
  let page = 0;
  const perPage = 100;
  
  while (true) {
    const response = await fetch(
      `https://${domain}/api/v2/users?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    users = users.concat(data);
    
    if (data.length < perPage) break;
    page++;
  }
  
  return users;
};
```

## Best Practices

### Security

1. **Token Management**
   - Use short-lived tokens
   - Store tokens securely
   - Implement token rotation

2. **Scopes**
   - Request minimal required scopes
   - Use separate tokens for different operations
   - Regularly audit granted permissions

### Performance

1. **Batch Operations**
   - Use bulk endpoints when available
   - Implement pagination for large datasets
   - Cache frequently accessed data

2. **Rate Limiting**
   - Implement exponential backoff
   - Monitor rate limit headers
   - Use bulk operations to reduce API calls

## Code Examples

### TypeScript SDK Usage

```typescript
import { ManagementClient } from 'auth0';

const management = new ManagementClient({
  domain: '{YOUR_ACCOUNT}.auth0.com',
  clientId: '{YOUR_CLIENT_ID}',
  clientSecret: '{YOUR_CLIENT_SECRET}',
});

// Get all users
const getUsers = async () => {
  try {
    const users = await management.users.getAll();
    return users;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Create a user
const createUser = async (userData: any) => {
  try {
    const user = await management.users.create(userData);
    return user;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

## Additional Resources

- [Auth0 Management API Explorer](https://auth0.com/docs/api/management/v2)
- [Auth0 Management API Tokens](https://auth0.com/docs/tokens/management-api-access-tokens)
- [Rate Limit Policy](https://auth0.com/docs/policies/rate-limits)
- [Auth0 Node.js SDK](https://github.com/auth0/node-auth0)
