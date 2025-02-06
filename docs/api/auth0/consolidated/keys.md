# Keys API

This document details the Keys endpoints in the Auth0 Management API.

## Get Signing Keys

```http
GET /api/v2/keys/signing
```

Retrieves all signing keys.

### Response

```json
{
  "keys": [
    {
      "kid": "key_123",
      "cert": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
      "pkcs7": "-----BEGIN PKCS7-----\n...\n-----END PKCS7-----",
      "current": true,
      "next": false,
      "previous": false,
      "current_since": "2023-01-01T00:00:00.000Z",
      "current_until": "2024-01-01T00:00:00.000Z",
      "fingerprint": "00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF",
      "thumbprint": "0011223344556677889900AABBCCDDEEFF001122",
      "revoked": false,
      "revoked_at": null
    }
  ]
}
```

## Rotate Signing Key

```http
POST /api/v2/keys/signing/rotate
```

Rotates the signing key.

### Response

```json
{
  "kid": "key_123",
  "cert": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  "pkcs7": "-----BEGIN PKCS7-----\n...\n-----END PKCS7-----",
  "current": true,
  "next": false,
  "previous": false,
  "current_since": "2023-01-01T00:00:00.000Z",
  "current_until": "2024-01-01T00:00:00.000Z",
  "fingerprint": "00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF",
  "thumbprint": "0011223344556677889900AABBCCDDEEFF001122",
  "revoked": false,
  "revoked_at": null
}
```

## Get Signing Key

```http
GET /api/v2/keys/signing/{kid}
```

Retrieves a signing key by ID.

### Parameters

| Parameter | Type   | Description                           |
| --------- | ------ | ------------------------------------- |
| kid       | string | The ID of the signing key to retrieve |

### Response

```json
{
  "kid": "key_123",
  "cert": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  "pkcs7": "-----BEGIN PKCS7-----\n...\n-----END PKCS7-----",
  "current": true,
  "next": false,
  "previous": false,
  "current_since": "2023-01-01T00:00:00.000Z",
  "current_until": "2024-01-01T00:00:00.000Z",
  "fingerprint": "00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF",
  "thumbprint": "0011223344556677889900AABBCCDDEEFF001122",
  "revoked": false,
  "revoked_at": null
}
```

## Revoke Signing Key

```http
PUT /api/v2/keys/signing/{kid}/revoke
```

Revokes a signing key.

### Parameters

| Parameter | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| kid       | string | The ID of the signing key to revoke |

### Response

```json
{
  "kid": "key_123",
  "cert": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  "pkcs7": "-----BEGIN PKCS7-----\n...\n-----END PKCS7-----",
  "current": false,
  "next": false,
  "previous": true,
  "current_since": "2023-01-01T00:00:00.000Z",
  "current_until": "2024-01-01T00:00:00.000Z",
  "fingerprint": "00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF",
  "thumbprint": "0011223344556677889900AABBCCDDEEFF001122",
  "revoked": true,
  "revoked_at": "2023-01-01T00:00:00.000Z"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid key operation",
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
  "message": "Key not found",
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

1. **Key Management**

   - Rotate keys regularly
   - Monitor key expiration
   - Secure key storage
   - Document key usage

2. **Security**

   - Use strong algorithms
   - Implement key backup
   - Monitor key operations
   - Handle revocation properly

3. **Operations**
   - Plan key rotations
   - Test key changes
   - Monitor key health
   - Document procedures

## Rate Limiting

The Keys API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Key States

1. **Current**

   - Active signing key
   - Used for new tokens
   - Recently rotated
   - Not revoked

2. **Previous**

   - Old signing key
   - Used for verification
   - Being phased out
   - May be revoked

3. **Next**
   - Future signing key
   - Prepared for rotation
   - Not yet active
   - Ready for use

### Key Rotation Process

1. **Preparation**

   - Generate new key
   - Set as next key
   - Update configuration
   - Test validation

2. **Rotation**

   - Make next key current
   - Move current to previous
   - Update applications
   - Monitor errors

3. **Cleanup**
   - Remove old keys
   - Update documentation
   - Verify operations
   - Archive information

### Certificate Information

Example certificate details:

```
Subject: CN=*.auth0.com
Issuer: CN=Auth0 Certificate Authority
Valid From: 2023-01-01T00:00:00Z
Valid To: 2024-01-01T00:00:00Z
Serial Number: 1234567890
Key Usage: Digital Signature
Enhanced Key Usage: Server Authentication
```
