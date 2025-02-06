# Device Credentials API

This document details the Device Credentials endpoints in the Auth0 Management API.

## Get Device Credentials

```http
GET /api/v2/device-credentials
```

Retrieves device credentials.

### Query Parameters

| Parameter      | Type    | Description                                       |
| -------------- | ------- | ------------------------------------------------- |
| user_id        | string  | Filter by user ID                                 |
| client_id      | string  | Filter by client ID                               |
| type           | string  | Filter by credential type                         |
| fields         | string  | Comma-separated list of fields to include         |
| include_fields | boolean | Whether specified fields are included or excluded |

### Response

```json
[
  {
    "id": "dcr_123",
    "device_name": "iPhone 12",
    "device_id": "device_123",
    "type": "public_key",
    "user_id": "user_123",
    "client_id": "client_123",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

## Create Device Credential

```http
POST /api/v2/device-credentials
```

Creates a new device credential.

### Request Body

```json
{
  "device_name": "iPhone 12",
  "device_id": "device_123",
  "type": "public_key",
  "value": "public-key-value",
  "user_id": "user_123",
  "client_id": "client_123"
}
```

### Response

```json
{
  "id": "dcr_123",
  "device_name": "iPhone 12",
  "device_id": "device_123",
  "type": "public_key",
  "user_id": "user_123",
  "client_id": "client_123",
  "created_at": "2023-01-01T00:00:00.000Z"
}
```

## Delete Device Credential

```http
DELETE /api/v2/device-credentials/{id}
```

Deletes a device credential.

### Parameters

| Parameter | Type   | Description                               |
| --------- | ------ | ----------------------------------------- |
| id        | string | The ID of the device credential to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Device Credential Types

Available device credential types:

- `public_key`: Public key credential
- `refresh_token`: Refresh token credential
- `rotating_refresh_token`: Rotating refresh token credential

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid device credential configuration",
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
  "message": "Device credential not found",
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

   - Regularly audit device credentials
   - Remove unused or suspicious devices
   - Monitor device credential usage
   - Implement device fingerprinting

2. **Management**

   - Use descriptive device names
   - Track device types and models
   - Maintain device inventory
   - Document credential lifecycle

3. **User Experience**
   - Notify users of new device registrations
   - Allow users to manage their devices
   - Provide device activity history
   - Support device revocation

## Rate Limiting

The Device Credentials API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Device Credential Lifecycle

1. **Creation**

   - Generated during device registration
   - Associated with specific user and client
   - Assigned unique identifier

2. **Usage**

   - Used for device authentication
   - Validates device identity
   - Enables secure access

3. **Deletion**
   - Performed during device removal
   - Invalidates device access
   - Triggers security events

### Security Considerations

1. **Device Verification**

   - Implement strong device verification
   - Use secure key storage
   - Validate device integrity

2. **Monitoring**

   - Track suspicious activities
   - Monitor failed authentications
   - Alert on unusual patterns

3. **Compliance**
   - Follow data protection regulations
   - Maintain audit trails
   - Document security measures
