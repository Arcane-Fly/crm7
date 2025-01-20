# Clients (Applications) API

This document details the Clients endpoints in the Auth0 Management API.

## Get Clients

```http
GET /api/v2/clients
```

Retrieves all clients (applications).

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number, zero based |
| per_page | number | Number of results per page |
| include_totals | boolean | Include total number of clients |
| is_global | boolean | Filter by global status |
| is_first_party | boolean | Filter by first party status |
| app_type | string | Filter by application type |

### Response

```json
[
  {
    "client_id": "client_123",
    "name": "My Application",
    "description": "My Application Description",
    "app_type": "regular_web",
    "logo_uri": "https://example.com/logo.png",
    "is_first_party": true,
    "callbacks": ["https://example.com/callback"],
    "allowed_origins": ["https://example.com"],
    "web_origins": ["https://example.com"],
    "client_secret": "your-client-secret",
    "jwt_configuration": {
      "lifetime_in_seconds": 36000,
      "secret_encoded": true
    },
    "sso_disabled": false
  }
]
```

## Create Client

```http
POST /api/v2/clients
```

Creates a new client application.

### Request Body

```json
{
  "name": "My Application",
  "description": "My Application Description",
  "app_type": "regular_web",
  "callbacks": ["https://example.com/callback"],
  "allowed_origins": ["https://example.com"],
  "web_origins": ["https://example.com"],
  "jwt_configuration": {
    "lifetime_in_seconds": 36000,
    "secret_encoded": true
  },
  "sso_disabled": false
}
```

### Response

```json
{
  "client_id": "client_123",
  "client_secret": "generated-client-secret",
  "name": "My Application",
  "description": "My Application Description",
  "app_type": "regular_web",
  "callbacks": ["https://example.com/callback"],
  "allowed_origins": ["https://example.com"],
  "web_origins": ["https://example.com"],
  "jwt_configuration": {
    "lifetime_in_seconds": 36000,
    "secret_encoded": true
  },
  "sso_disabled": false
}
```

## Get Client

```http
GET /api/v2/clients/{id}
```

Retrieves a client by ID.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the client to retrieve |

### Response

```json
{
  "client_id": "client_123",
  "name": "My Application",
  "description": "My Application Description",
  "app_type": "regular_web",
  "logo_uri": "https://example.com/logo.png",
  "is_first_party": true,
  "callbacks": ["https://example.com/callback"],
  "allowed_origins": ["https://example.com"],
  "web_origins": ["https://example.com"],
  "jwt_configuration": {
    "lifetime_in_seconds": 36000,
    "secret_encoded": true
  },
  "sso_disabled": false
}
```

## Update Client

```http
PATCH /api/v2/clients/{id}
```

Updates a client.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the client to update |

### Request Body

```json
{
  "name": "Updated Application Name",
  "description": "Updated Application Description",
  "callbacks": [
    "https://example.com/callback",
    "https://example.com/callback2"
  ],
  "jwt_configuration": {
    "lifetime_in_seconds": 72000
  }
}
```

## Delete Client

```http
DELETE /api/v2/clients/{id}
```

Deletes a client.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the client to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Rotate Client Secret

```http
POST /api/v2/clients/{id}/rotate-secret
```

Rotates a client secret.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the client |

### Response

```json
{
  "client_secret": "new-client-secret"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid client configuration",
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
  "message": "Client not found",
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

## Application Types

Available application types:
- `native`: Mobile or desktop app
- `spa`: Single-page web application
- `regular_web`: Traditional web application
- `non_interactive`: Machine-to-machine application
- `rms`: Resource Management System

## Best Practices

1. **Security**
   - Rotate client secrets regularly
   - Use appropriate application types
   - Implement proper callback URL validation
   - Enable OIDC conformant mode

2. **Configuration**
   - Use descriptive names and descriptions
   - Document callback URLs
   - Configure appropriate token lifetimes
   - Enable/disable features based on requirements

3. **Monitoring**
   - Monitor client usage
   - Track failed authentication attempts
   - Review client permissions regularly

## Rate Limiting

The Clients API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
