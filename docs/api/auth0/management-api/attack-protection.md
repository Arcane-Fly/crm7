# Attack Protection API

This document details the Attack Protection endpoints in the Auth0 Management API.

## Breached Password Detection

### Get Configuration

```http
GET /api/v2/attack-protection/breached-password-detection
```

Retrieves the breached password detection settings.

### Response

```json
{
  "enabled": true,
  "shields": [
    "admin_notification",
    "block"
  ],
  "admin_notification_frequency": [
    "immediately"
  ],
  "method": "standard"
}
```

### Update Configuration

```http
PATCH /api/v2/attack-protection/breached-password-detection
```

Updates the breached password detection settings.

#### Request Body

```json
{
  "enabled": true,
  "shields": [
    "admin_notification",
    "block"
  ],
  "admin_notification_frequency": [
    "immediately",
    "daily"
  ],
  "method": "enhanced"
}
```

## Brute Force Protection

### Get Configuration

```http
GET /api/v2/attack-protection/brute-force-protection
```

Retrieves the brute force protection settings.

### Response

```json
{
  "enabled": true,
  "shields": [
    "block",
    "user_notification"
  ],
  "mode": "count_per_identifier_and_ip",
  "allowlist": ["192.0.2.1"],
  "max_attempts": 10,
  "block_duration_minutes": 60
}
```

### Update Configuration

```http
PATCH /api/v2/attack-protection/brute-force-protection
```

Updates the brute force protection settings.

#### Request Body

```json
{
  "enabled": true,
  "shields": [
    "block",
    "user_notification"
  ],
  "mode": "count_per_identifier_and_ip",
  "allowlist": ["192.0.2.1", "192.0.2.2"],
  "max_attempts": 5,
  "block_duration_minutes": 30
}
```

## Suspicious IP Throttling

### Get Configuration

```http
GET /api/v2/attack-protection/suspicious-ip-throttling
```

Retrieves the suspicious IP throttling settings.

### Response

```json
{
  "enabled": true,
  "shields": [
    "admin_notification",
    "block"
  ],
  "allowlist": ["192.0.2.1"],
  "stage": {
    "pre_login": {
      "max_attempts": 100,
      "rate": 864000
    },
    "pre_user_registration": {
      "max_attempts": 50,
      "rate": 1200
    }
  }
}
```

### Update Configuration

```http
PATCH /api/v2/attack-protection/suspicious-ip-throttling
```

Updates the suspicious IP throttling settings.

#### Request Body

```json
{
  "enabled": true,
  "shields": [
    "admin_notification",
    "block"
  ],
  "allowlist": ["192.0.2.1", "192.0.2.2"],
  "stage": {
    "pre_login": {
      "max_attempts": 150,
      "rate": 864000
    },
    "pre_user_registration": {
      "max_attempts": 100,
      "rate": 1200
    }
  }
}
```

## Common Parameters and Properties

### Shields

Available shield types:

- `block`: Blocks the suspicious activity
- `admin_notification`: Sends notifications to administrators
- `user_notification`: Sends notifications to affected users

### Methods (Breached Password Detection)

- `standard`: Basic breached password detection
- `enhanced`: More comprehensive detection with additional checks

### Modes (Brute Force Protection)

- `count_per_identifier_and_ip`: Counts attempts per user and IP
- `count_per_identifier`: Counts attempts per user regardless of IP
- `count_per_ip`: Counts attempts per IP regardless of user

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid configuration",
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

### 429 Too Many Requests

```json
{
  "error": "too_many_requests",
  "message": "Rate limit exceeded",
  "statusCode": 429
}
```

## Best Practices

1. **Configuration Strategy**
   - Start with conservative settings and adjust based on actual threats
   - Maintain an up-to-date allowlist
   - Document all configuration changes

2. **Monitoring**
   - Monitor attack patterns regularly
   - Review admin notifications promptly
   - Track false positives

3. **Integration**
   - Integrate with security information and event management (SIEM) systems
   - Set up automated alerts for significant changes
   - Maintain audit logs of configuration changes

## Rate Limiting

The Attack Protection API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
