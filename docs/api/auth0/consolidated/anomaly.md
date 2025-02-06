# Anomaly Detection API

This document details the Anomaly Detection endpoints in the Auth0 Management API.

## Get Blocked IP

```http
GET /api/v2/anomaly/blocks/ips/{id}
```

Retrieves information about a blocked IP address.

### Parameters

| Parameter | Type   | Description                                |
| --------- | ------ | ------------------------------------------ |
| id        | string | The IP address to retrieve information for |

### Response

```json
{
  "ip": "192.0.2.1",
  "blocked_for": [
    {
      "identifier": "brute_force_protection",
      "blocked_at": "2023-01-01T00:00:00.000Z",
      "expires_at": "2023-01-01T01:00:00.000Z"
    }
  ]
}
```

## Remove IP from Blocked IPs

```http
DELETE /api/v2/anomaly/blocks/ips/{id}
```

Removes an IP address from the blocked IPs list.

### Parameters

| Parameter | Type   | Description               |
| --------- | ------ | ------------------------- |
| id        | string | The IP address to unblock |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Error Responses

Anomaly Detection API endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid IP address format",
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
  "message": "IP address not found in blocked list",
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

## Additional Information

### Blocking Triggers

IPs can be blocked for the following reasons:

1. **Brute Force Protection**: Multiple failed login attempts
2. **Suspicious IP Reputation**: IP address has been identified as potentially malicious
3. **Breached Password Detection**: Multiple attempts to use known compromised passwords

### Block Duration

- Blocks typically last for 24 hours by default
- Duration can be configured in the Auth0 Dashboard
- Manual unblocking via the API overrides the automatic expiration

### Best Practices

1. **Monitoring**:

   - Regularly monitor blocked IPs
   - Look for patterns that might indicate targeted attacks

2. **Unblocking**:

   - Verify the legitimacy of unblock requests
   - Document reasons for manual unblocks
   - Consider implementing an approval process for unblocking

3. **Integration**:
   - Consider integrating with SIEM systems
   - Set up alerts for unusual blocking patterns
   - Maintain audit logs of all unblock operations

## Rate Limiting

The Anomaly Detection API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
