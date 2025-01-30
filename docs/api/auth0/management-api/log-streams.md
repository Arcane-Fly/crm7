# Log Streams API

This document details the Log Streams endpoints in the Auth0 Management API.

## Get Log Streams

```http
GET /api/v2/log-streams
```

Retrieves all log streams.

### Response

```json
[
  {
    "id": "ls_123",
    "name": "AWS EventBridge Stream",
    "type": "eventbridge",
    "status": "active",
    "sink": {
      "aws_account_id": "123456789012",
      "aws_region": "us-east-1",
      "aws_partner_event_source": "aws.partner/auth0.com/123456/default"
    }
  }
]
```

## Create Log Stream

```http
POST /api/v2/log-streams
```

Creates a new log stream.

### Request Body

```json
{
  "name": "AWS EventBridge Stream",
  "type": "eventbridge",
  "sink": {
    "aws_account_id": "123456789012",
    "aws_region": "us-east-1"
  }
}
```

### Response

```json
{
  "id": "ls_123",
  "name": "AWS EventBridge Stream",
  "type": "eventbridge",
  "status": "active",
  "sink": {
    "aws_account_id": "123456789012",
    "aws_region": "us-east-1",
    "aws_partner_event_source": "aws.partner/auth0.com/123456/default"
  }
}
```

## Get Log Stream

```http
GET /api/v2/log-streams/{id}
```

Retrieves a log stream by ID.

### Parameters

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| id        | string | The ID of the log stream to retrieve |

### Response

```json
{
  "id": "ls_123",
  "name": "AWS EventBridge Stream",
  "type": "eventbridge",
  "status": "active",
  "sink": {
    "aws_account_id": "123456789012",
    "aws_region": "us-east-1",
    "aws_partner_event_source": "aws.partner/auth0.com/123456/default"
  }
}
```

## Update Log Stream

```http
PATCH /api/v2/log-streams/{id}
```

Updates a log stream.

### Parameters

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | The ID of the log stream to update |

### Request Body

```json
{
  "name": "Updated EventBridge Stream",
  "status": "paused"
}
```

## Delete Log Stream

```http
DELETE /api/v2/log-streams/{id}
```

Deletes a log stream.

### Parameters

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | The ID of the log stream to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Stream Types

Available stream types:

- `eventbridge`: AWS EventBridge
- `http`: HTTP Webhook
- `datadog`: Datadog
- `splunk`: Splunk
- `sumo`: Sumo Logic
- `mixpanel`: Mixpanel

## Stream Status

Possible stream statuses:

- `active`: Stream is sending logs
- `paused`: Stream is temporarily stopped
- `suspended`: Stream is suspended due to errors
- `disabled`: Stream is disabled by admin

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid stream configuration",
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
  "message": "Stream not found",
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

1. **Stream Configuration**

   - Monitor stream health
   - Configure error handling
   - Set appropriate filters
   - Document stream purpose

2. **Performance**

   - Monitor throughput
   - Handle backpressure
   - Set batch sizes
   - Configure timeouts

3. **Security**
   - Secure endpoints
   - Validate payloads
   - Monitor access
   - Encrypt sensitive data

## Rate Limiting

The Log Streams API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Event Types

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

### Stream Configuration Examples

1. **HTTP Webhook**

```json
{
  "name": "My Webhook",
  "type": "http",
  "sink": {
    "endpoint": "https://example.com/logs",
    "authorization": "Bearer token",
    "content_type": "application/json",
    "content_format": "JSONLINES"
  }
}
```

2. **Datadog**

```json
{
  "name": "Datadog Stream",
  "type": "datadog",
  "sink": {
    "api_key": "your-datadog-api-key",
    "region": "us",
    "service": "auth0"
  }
}
```

3. **Splunk**

```json
{
  "name": "Splunk Stream",
  "type": "splunk",
  "sink": {
    "domain": "splunk.example.com",
    "port": 8088,
    "token": "your-splunk-token",
    "secure": true
  }
}
```
