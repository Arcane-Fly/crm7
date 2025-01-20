# Hooks API

This document details the Hooks endpoints in the Auth0 Management API.

## Get Hooks

```http
GET /api/v2/hooks
```

Retrieves all hooks.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number, zero based |
| per_page | number | Number of results per page |
| include_totals | boolean | Include total number of hooks |
| enabled | boolean | Filter by enabled status |
| trigger_id | string | Filter by trigger ID |

### Response

```json
{
  "hooks": [
    {
      "id": "hook_123",
      "name": "My Hook",
      "script": "function (user, context, callback) { callback(null, user, context); }",
      "trigger_id": "pre-user-registration",
      "enabled": true,
      "secrets": {
        "API_KEY": "..."
      },
      "dependencies": {
        "auth0": "2.42.0"
      },
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "start": 0,
  "limit": 10
}
```

## Create Hook

```http
POST /api/v2/hooks
```

Creates a new hook.

### Request Body

```json
{
  "name": "My Hook",
  "script": "function (user, context, callback) { callback(null, user, context); }",
  "trigger_id": "pre-user-registration",
  "enabled": true,
  "dependencies": {
    "auth0": "2.42.0"
  }
}
```

### Response

```json
{
  "id": "hook_123",
  "name": "My Hook",
  "script": "function (user, context, callback) { callback(null, user, context); }",
  "trigger_id": "pre-user-registration",
  "enabled": true,
  "secrets": {},
  "dependencies": {
    "auth0": "2.42.0"
  },
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Get Hook

```http
GET /api/v2/hooks/{id}
```

Retrieves a hook by ID.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the hook to retrieve |

### Response

```json
{
  "id": "hook_123",
  "name": "My Hook",
  "script": "function (user, context, callback) { callback(null, user, context); }",
  "trigger_id": "pre-user-registration",
  "enabled": true,
  "secrets": {
    "API_KEY": "..."
  },
  "dependencies": {
    "auth0": "2.42.0"
  },
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Update Hook

```http
PATCH /api/v2/hooks/{id}
```

Updates a hook.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the hook to update |

### Request Body

```json
{
  "name": "Updated Hook Name",
  "script": "function (user, context, callback) { /* Updated code */ callback(null, user, context); }",
  "enabled": false
}
```

## Delete Hook

```http
DELETE /api/v2/hooks/{id}
```

Deletes a hook.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the hook to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Get Hook Secrets

```http
GET /api/v2/hooks/{id}/secrets
```

Retrieves hook secrets.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the hook |

### Response

```json
{
  "API_KEY": "...",
  "CLIENT_SECRET": "..."
}
```

## Update Hook Secrets

```http
PATCH /api/v2/hooks/{id}/secrets
```

Updates hook secrets.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the hook |

### Request Body

```json
{
  "API_KEY": "new-api-key",
  "NEW_SECRET": "secret-value"
}
```

## Delete Hook Secrets

```http
DELETE /api/v2/hooks/{id}/secrets
```

Deletes hook secrets.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the hook |
| secret_names | array | Array of secret names to delete |

### Request Body

```json
{
  "secret_names": ["API_KEY", "CLIENT_SECRET"]
}
```

## Hook Triggers

Available hook triggers:
- `pre-user-registration`: Before user signup
- `post-user-registration`: After user signup
- `post-change-password`: After password change
- `send-phone-message`: When sending SMS
- `credentials-exchange`: During token exchange
- `pre-user-update`: Before user profile update
- `post-user-update`: After user profile update

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid hook configuration",
  "statusCode": 400
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Access token is invalid",
  "statusCode": 401
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Hook not found",
  "statusCode": 404
}
```

### 429 Too Many Requests
```json
{
  "error": "too_many_requests",
  "message": "Rate limit exceeded",
  "statusCode": 429
}
```

## Best Practices

1. **Hook Development**
   - Test hooks thoroughly
   - Handle errors gracefully
   - Use async/await pattern
   - Document hook purpose

2. **Security**
   - Secure secret storage
   - Validate input data
   - Implement timeouts
   - Monitor hook execution

3. **Performance**
   - Optimize code execution
   - Minimize external calls
   - Handle rate limits
   - Cache when possible

## Rate Limiting

The Hooks API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Hook Context

Available context properties:
```javascript
{
  tenant: {
    id: 'tenant_id',
    name: 'tenant_name'
  },
  request: {
    ip: '123.123.123.123',
    language: 'en-US',
    hostname: 'login.example.com'
  },
  connection: {
    id: 'con_123',
    name: 'Username-Password-Authentication'
  },
  user: {
    user_id: 'auth0|123',
    email: 'user@example.com',
    name: 'John Smith'
  }
}
```

### Hook Dependencies

Common dependencies:
```json
{
  "auth0": "2.42.0",
  "axios": "0.21.1",
  "jsonwebtoken": "8.5.1",
  "lodash": "4.17.21"
}
```

### Hook Execution

1. **Initialization**
   - Hook triggered
   - Context prepared
   - Dependencies loaded
   - Secrets injected

2. **Execution**
   - Script runs
   - Context modified
   - External calls made
   - Results processed

3. **Completion**
   - Results returned
   - Logs generated
   - Metrics updated
   - Cleanup performed
