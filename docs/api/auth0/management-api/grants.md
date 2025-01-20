# Grants API

This document details the Grants endpoints in the Auth0 Management API.

## Get Grants

```http
GET /api/v2/grants
```

Retrieves all grants.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number, zero based |
| per_page | number | Number of results per page |
| include_totals | boolean | Include total number of grants |
| user_id | string | Filter by user ID |
| client_id | string | Filter by client ID |
| audience | string | Filter by audience |

### Response

```json
[
  {
    "id": "gra_123",
    "clientID": "client_123",
    "user_id": "user_123",
    "audience": "https://api.example.com",
    "scope": [
      "read:users",
      "update:users"
    ],
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

## Delete Grant by ID

```http
DELETE /api/v2/grants/{id}
```

Deletes a grant.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the grant to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Delete Grants by User ID

```http
DELETE /api/v2/grants
```

Deletes all grants for a user.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| user_id | string | The ID of the user whose grants to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid request parameters",
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
  "message": "Grant not found",
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

1. **Grant Management**
   - Regularly audit grants
   - Remove unused grants
   - Monitor grant usage
   - Document grant purposes

2. **Security**
   - Review grant scopes
   - Implement least privilege
   - Monitor suspicious activity
   - Maintain audit logs

3. **Maintenance**
   - Clean up expired grants
   - Update grant documentation
   - Review grant policies
   - Monitor grant metrics

## Rate Limiting

The Grants API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Grant Types

1. **Authorization Code Grant**
   - Used for web applications
   - Most secure grant type
   - Supports refresh tokens
   - Requires client authentication

2. **Implicit Grant**
   - Used for single-page applications
   - No refresh tokens
   - Tokens returned in URL fragment
   - No client authentication

3. **Client Credentials Grant**
   - Used for machine-to-machine
   - No user interaction
   - Access token only
   - Requires client authentication

4. **Resource Owner Password Grant**
   - Used for trusted applications
   - Direct username/password
   - Not recommended for third-party apps
   - Supports refresh tokens

### Grant Scopes

Common scope patterns:
```
read:users          # Read user information
write:users         # Modify user information
delete:users        # Delete users
create:users        # Create users
read:logs          # Read audit logs
read:stats         # Read statistics
```

### Grant Lifecycle

1. **Creation**
   - Grant requested
   - Scopes evaluated
   - User consent obtained
   - Grant recorded

2. **Usage**
   - Grant validated
   - Tokens issued
   - Scopes enforced
   - Activity logged

3. **Termination**
   - Grant revoked
   - Tokens invalidated
   - Resources updated
   - Cleanup performed
