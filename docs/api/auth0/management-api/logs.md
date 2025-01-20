# Logs API

This document details the Logs endpoints in the Auth0 Management API.

## Get Logs

```http
GET /api/v2/logs
```

Retrieves log entries.

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number, zero based |
| per_page | number | Number of results per page |
| sort | string | Sort field and order (e.g., date:-1) |
| fields | string | Fields to include in response |
| include_fields | boolean | True to include fields, false to exclude |
| include_totals | boolean | True to include totals |
| from | string | Log entries from this date |
| take | number | Number of entries to retrieve |
| q | string | Query in Lucene query string syntax |

### Response

```json
{
  "start": 0,
  "limit": 50,
  "length": 1,
  "total": 1,
  "logs": [
    {
      "date": "2023-01-01T00:00:00.000Z",
      "type": "s",
      "description": "Success Login",
      "client_id": "client_123",
      "client_name": "My Application",
      "ip": "192.0.2.1",
      "user_id": "user_123",
      "user_name": "john.smith@example.com",
      "connection": "Username-Password-Authentication",
      "details": {
        "stats": {
          "loginsCount": 57
        }
      }
    }
  ]
}
```

## Get Log Entry

```http
GET /api/v2/logs/{id}
```

Retrieves a log entry by ID.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | The ID of the log entry to retrieve |

### Response

```json
{
  "date": "2023-01-01T00:00:00.000Z",
  "type": "s",
  "description": "Success Login",
  "client_id": "client_123",
  "client_name": "My Application",
  "ip": "192.0.2.1",
  "user_id": "user_123",
  "user_name": "john.smith@example.com",
  "connection": "Username-Password-Authentication",
  "details": {
    "stats": {
      "loginsCount": 57
    }
  }
}
```

## Log Event Types

Common log event types:
- `s`: Success Login
- `f`: Failed Login
- `fu`: Failed Login (Invalid Email/Username)
- `fp`: Failed Login (Wrong Password)
- `sapi`: API Operation
- `fapi`: Failed API Operation
- `limit_wc`: Rate Limit Exceeded
- `ss`: Success Signup
- `fs`: Failed Signup
- `sv`: Success Email Verification
- `fv`: Failed Email Verification
- `sdu`: Success User Deletion
- `fdu`: Failed User Deletion
- `scpr`: Success Change Password Request
- `fcpr`: Failed Change Password Request
- `sce`: Success Change Email
- `fce`: Failed Change Email
- `sd`: Success Delegation
- `fd`: Failed Delegation

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid query parameters",
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
  "message": "Log entry not found",
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

1. **Log Management**
   - Monitor critical events
   - Set up alerts
   - Archive old logs
   - Analyze patterns

2. **Security**
   - Track failed attempts
   - Monitor suspicious IPs
   - Review API access
   - Set up notifications

3. **Performance**
   - Use efficient queries
   - Implement pagination
   - Cache results
   - Monitor rate limits

## Rate Limiting

The Logs API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Query Examples

1. **Search by User**
```
user_id:"auth0|123" AND type:s
```

2. **Search by Date Range**
```
date:[2023-01-01 TO 2023-01-31] AND type:f
```

3. **Search by IP Address**
```
ip:"192.0.2.1" AND type:f
```

### Log Fields

Available fields for querying:
- `date`: Event timestamp
- `type`: Event type
- `description`: Event description
- `client_id`: Application ID
- `client_name`: Application name
- `ip`: IP address
- `user_id`: User ID
- `user_name`: Username or email
- `connection`: Connection name
- `connection_id`: Connection ID
- `details`: Additional event details
- `hostname`: Host name
- `user_agent`: User agent string
- `location_info`: Geographic location
- `details.request.method`: HTTP method
- `details.request.path`: Request path
- `details.response.statusCode`: Response status

### Log Retention

Log retention periods:
- Free: 2 days
- Developer: 7 days
- Developer Pro: 30 days
- Enterprise: 30+ days

### Export Options

Methods to export logs:
1. **API Export**
   - Use pagination
   - Filter by date
   - Select fields
   - Sort results

2. **Log Streams**
   - Real-time export
   - Multiple destinations
   - Custom formatting
   - Reliable delivery

3. **Dashboard Export**
   - Manual download
   - CSV format
   - Date range selection
   - Field selection
