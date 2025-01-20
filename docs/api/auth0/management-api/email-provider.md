# Email Provider API

This document details the Email Provider endpoints in the Auth0 Management API.

## Get Email Provider

```http
GET /api/v2/emails/provider
```

Retrieves the email provider settings.

### Response

```json
{
  "name": "smtp",
  "enabled": true,
  "default_from_address": "sender@example.com",
  "credentials": {
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "smtp_user": "smtp-user"
  }
}
```

## Configure Email Provider

```http
POST /api/v2/emails/provider
```

Configures the email provider.

### Request Body

```json
{
  "name": "smtp",
  "enabled": true,
  "default_from_address": "sender@example.com",
  "credentials": {
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "smtp_user": "smtp-user",
    "smtp_pass": "smtp-password"
  }
}
```

### Response

```json
{
  "name": "smtp",
  "enabled": true,
  "default_from_address": "sender@example.com",
  "credentials": {
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "smtp_user": "smtp-user"
  }
}
```

## Update Email Provider

```http
PATCH /api/v2/emails/provider
```

Updates the email provider settings.

### Request Body

```json
{
  "enabled": true,
  "default_from_address": "new-sender@example.com",
  "credentials": {
    "smtp_port": 465,
    "smtp_pass": "new-smtp-password"
  }
}
```

## Delete Email Provider

```http
DELETE /api/v2/emails/provider
```

Deletes the email provider configuration.

### Response

A successful deletion returns a 204 No Content status with no response body.

## Provider Types

Available provider types:
- `smtp`: Custom SMTP server
- `mandrill`: Mandrill (by Mailchimp)
- `sendgrid`: SendGrid
- `sparkpost`: SparkPost
- `mailgun`: Mailgun
- `ses`: Amazon SES

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid provider configuration",
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
  "message": "Email provider not found",
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
   - Use secure SMTP ports (587 or 465)
   - Enable TLS/SSL encryption
   - Rotate SMTP credentials regularly
   - Use strong passwords

2. **Configuration**
   - Test provider settings before enabling
   - Configure SPF and DKIM records
   - Set appropriate sending limits
   - Monitor delivery rates

3. **Maintenance**
   - Monitor provider status
   - Keep credentials up to date
   - Review sending statistics
   - Handle bounces appropriately

## Provider-Specific Settings

### SMTP
```json
{
  "name": "smtp",
  "credentials": {
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "smtp_user": "smtp-user",
    "smtp_pass": "smtp-password"
  }
}
```

### SendGrid
```json
{
  "name": "sendgrid",
  "credentials": {
    "api_key": "your-sendgrid-api-key"
  }
}
```

### Amazon SES
```json
{
  "name": "ses",
  "credentials": {
    "accessKeyId": "your-aws-access-key-id",
    "secretAccessKey": "your-aws-secret-access-key",
    "region": "us-east-1"
  }
}
```

## Rate Limiting

The Email Provider API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Testing Configuration

1. **SMTP Test**
   - Verify server connection
   - Test authentication
   - Send test email
   - Check delivery status

2. **DNS Setup**
   - Configure SPF records
   - Set up DKIM signing
   - Add DMARC policy
   - Verify DNS propagation

3. **Monitoring**
   - Track delivery rates
   - Monitor bounce rates
   - Check spam reports
   - Review authentication results
