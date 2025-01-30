# Enterprise API

This document details the Enterprise endpoints in the Auth0 Management API.

## Get Enterprise Connections

```http
GET /api/v2/enterprise
```

Retrieves all enterprise connections.

### Query Parameters

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| page      | number | Page number, zero based       |
| per_page  | number | Number of results per page    |
| strategy  | string | Filter by connection strategy |
| name      | string | Filter by connection name     |

### Response

```json
[
  {
    "id": "con_123",
    "name": "corporate-directory",
    "strategy": "ad",
    "enabled_clients": ["client_123"],
    "options": {
      "tenant_domain": "example.com",
      "domain_aliases": ["example.net"],
      "icon_url": "https://example.com/icon.png",
      "ips": ["192.0.2.1"],
      "domain_controllers": ["dc1.example.com"],
      "attributes": {
        "username": "sAMAccountName",
        "email": "mail"
      }
    }
  }
]
```

## Create Enterprise Connection

```http
POST /api/v2/enterprise
```

Creates a new enterprise connection.

### Request Body

```json
{
  "name": "corporate-directory",
  "strategy": "ad",
  "enabled_clients": ["client_123"],
  "options": {
    "tenant_domain": "example.com",
    "domain_aliases": ["example.net"],
    "icon_url": "https://example.com/icon.png",
    "ips": ["192.0.2.1"],
    "domain_controllers": ["dc1.example.com"],
    "attributes": {
      "username": "sAMAccountName",
      "email": "mail"
    }
  }
}
```

### Response

```json
{
  "id": "con_123",
  "name": "corporate-directory",
  "strategy": "ad",
  "enabled_clients": ["client_123"],
  "options": {
    "tenant_domain": "example.com",
    "domain_aliases": ["example.net"],
    "icon_url": "https://example.com/icon.png",
    "ips": ["192.0.2.1"],
    "domain_controllers": ["dc1.example.com"],
    "attributes": {
      "username": "sAMAccountName",
      "email": "mail"
    }
  }
}
```

## Get Enterprise Connection

```http
GET /api/v2/enterprise/{id}
```

Retrieves an enterprise connection by ID.

### Parameters

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| id        | string | The ID of the connection to retrieve |

### Response

```json
{
  "id": "con_123",
  "name": "corporate-directory",
  "strategy": "ad",
  "enabled_clients": ["client_123"],
  "options": {
    "tenant_domain": "example.com",
    "domain_aliases": ["example.net"],
    "icon_url": "https://example.com/icon.png",
    "ips": ["192.0.2.1"],
    "domain_controllers": ["dc1.example.com"],
    "attributes": {
      "username": "sAMAccountName",
      "email": "mail"
    }
  }
}
```

## Update Enterprise Connection

```http
PATCH /api/v2/enterprise/{id}
```

Updates an enterprise connection.

### Parameters

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | The ID of the connection to update |

### Request Body

```json
{
  "enabled_clients": ["client_123", "client_456"],
  "options": {
    "domain_aliases": ["example.net", "example.org"],
    "ips": ["192.0.2.1", "192.0.2.2"]
  }
}
```

## Delete Enterprise Connection

```http
DELETE /api/v2/enterprise/{id}
```

Deletes an enterprise connection.

### Parameters

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | The ID of the connection to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Enterprise Connection Strategies

Available enterprise connection strategies:

- `ad`: Active Directory
- `adfs`: Active Directory Federation Services
- `azure-ad`: Azure Active Directory
- `google-apps`: Google Workspace (formerly G Suite)
- `okta`: Okta
- `ping-federate`: PingFederate
- `saml`: Generic SAML
- `waad`: Windows Azure Active Directory

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

   - Use secure protocols (LDAPS, HTTPS)
   - Implement least privilege access
   - Enable certificate validation
   - Monitor access patterns

2. **Configuration**

   - Test connections before enabling
   - Document connection settings
   - Maintain IP allowlists
   - Configure failover options

3. **Maintenance**
   - Monitor connection health
   - Update certificates before expiry
   - Review access permissions
   - Audit connection usage

## Rate Limiting

The Enterprise API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Active Directory Configuration

```json
{
  "options": {
    "tenant_domain": "example.com",
    "domain_aliases": ["example.net"],
    "icon_url": "https://example.com/icon.png",
    "ips": ["192.0.2.1"],
    "domain_controllers": ["dc1.example.com"],
    "attributes": {
      "username": "sAMAccountName",
      "email": "mail",
      "given_name": "givenName",
      "family_name": "sn",
      "nickname": "displayName"
    },
    "set_user_root": "DC=example,DC=com",
    "scheduling": {
      "daily_start_time": "23:00",
      "daily_end_time": "05:00",
      "daily_scheduled": true,
      "max_batches": 100,
      "batch_size": 1000
    }
  }
}
```

### SAML Configuration

```json
{
  "options": {
    "signInEndpoint": "https://example.com/saml/signin",
    "signingCert": "CERTIFICATE",
    "signatureAlgorithm": "rsa-sha256",
    "digestAlgorithm": "sha256",
    "fieldsMap": {
      "email": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
      "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    }
  }
}
```
