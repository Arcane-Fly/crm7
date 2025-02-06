# Connections API

This document details the Connections endpoints in the Auth0 Management API.

## Get Connections

```http
GET /api/v2/connections
```

Retrieves all connections.

### Query Parameters

| Parameter      | Type    | Description                               |
| -------------- | ------- | ----------------------------------------- |
| page           | number  | Page number, zero based                   |
| per_page       | number  | Number of results per page                |
| strategy       | string  | Filter by connection strategy             |
| name           | string  | Filter by connection name                 |
| fields         | string  | Comma-separated list of fields to include |
| include_totals | boolean | Include total number of connections       |

### Response

```json
[
  {
    "id": "con_123",
    "name": "my-connection",
    "strategy": "auth0",
    "enabled_clients": ["client_123"],
    "options": {
      "requires_username": true,
      "password_policy": "fair",
      "password_history": {
        "enable": true,
        "size": 5
      }
    }
  }
]
```

## Create Connection

```http
POST /api/v2/connections
```

Creates a new connection.

### Request Body

```json
{
  "name": "my-connection",
  "strategy": "auth0",
  "enabled_clients": ["client_123"],
  "options": {
    "requires_username": true,
    "password_policy": "fair",
    "password_history": {
      "enable": true,
      "size": 5
    }
  }
}
```

### Response

```json
{
  "id": "con_123",
  "name": "my-connection",
  "strategy": "auth0",
  "enabled_clients": ["client_123"],
  "options": {
    "requires_username": true,
    "password_policy": "fair",
    "password_history": {
      "enable": true,
      "size": 5
    }
  }
}
```

## Get Connection

```http
GET /api/v2/connections/{id}
```

Retrieves a connection by ID.

### Parameters

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| id        | string | The ID of the connection to retrieve |

### Response

```json
{
  "id": "con_123",
  "name": "my-connection",
  "strategy": "auth0",
  "enabled_clients": ["client_123"],
  "options": {
    "requires_username": true,
    "password_policy": "fair",
    "password_history": {
      "enable": true,
      "size": 5
    }
  }
}
```

## Update Connection

```http
PATCH /api/v2/connections/{id}
```

Updates a connection.

### Parameters

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | The ID of the connection to update |

### Request Body

```json
{
  "enabled_clients": ["client_123", "client_456"],
  "options": {
    "password_policy": "good",
    "password_history": {
      "size": 10
    }
  }
}
```

## Delete Connection

```http
DELETE /api/v2/connections/{id}
```

Deletes a connection.

### Parameters

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | The ID of the connection to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Delete Connection Users

```http
DELETE /api/v2/connections/{id}/users
```

Deletes all users that belong to a connection.

### Parameters

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| id        | string | The ID of the connection |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Connection Strategies

Available connection strategies:

- `ad`: Active Directory
- `adfs`: Active Directory Federation Services
- `amazon`: Amazon
- `apple`: Apple
- `auth0`: Database
- `dropbox`: Dropbox
- `facebook`: Facebook
- `github`: GitHub
- `google-oauth2`: Google
- `linkedin`: LinkedIn
- `oauth2`: Generic OAuth2
- `oidc`: OpenID Connect
- `samlp`: SAML
- `twitter`: Twitter
- `waad`: Azure Active Directory
- `windowslive`: Microsoft Account

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid connection configuration",
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
  "message": "Connection not found",
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

1. **Security**

   - Use strong password policies
   - Enable password history
   - Configure appropriate connection options
   - Regularly review enabled clients

2. **Configuration**

   - Use meaningful connection names
   - Document connection settings
   - Test connections before enabling
   - Monitor connection health

3. **User Management**
   - Backup user data before deletion
   - Plan user migrations carefully
   - Monitor user import/export operations

## Rate Limiting

The Connections API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
