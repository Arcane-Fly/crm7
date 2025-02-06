# Guardian API

This document details the Guardian endpoints in the Auth0 Management API.

## Get Factors

```http
GET /api/v2/guardian/factors
```

Retrieves all multi-factor authentication factors.

### Response

```json
{
  "factors": [
    {
      "name": "push-notification",
      "enabled": true,
      "trial_expired": false
    },
    {
      "name": "sms",
      "enabled": true,
      "trial_expired": false
    },
    {
      "name": "otp",
      "enabled": true,
      "trial_expired": false
    }
  ]
}
```

## Get Enrollment

```http
GET /api/v2/guardian/enrollments/{id}
```

Retrieves an enrollment.

### Parameters

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| id        | string | The ID of the enrollment to retrieve |

### Response

```json
{
  "id": "dev_123",
  "status": "confirmed",
  "type": "authenticator",
  "name": "John's iPhone",
  "identifier": "john.smith@example.com",
  "phone_number": "+1234567890",
  "auth_method": "push-notification",
  "enrolled_at": "2023-01-01T00:00:00.000Z"
}
```

## Delete Enrollment

```http
DELETE /api/v2/guardian/enrollments/{id}
```

Deletes an enrollment.

### Parameters

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| id        | string | The ID of the enrollment to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Get Templates

```http
GET /api/v2/guardian/factors/sms/templates
```

Retrieves enrollment and verification SMS templates.

### Response

```json
{
  "enrollment_message": "Your verification code is: {{code}}",
  "verification_message": "Your verification code is: {{code}}"
}
```

## Update Templates

```http
PUT /api/v2/guardian/factors/sms/templates
```

Updates enrollment and verification SMS templates.

### Request Body

```json
{
  "enrollment_message": "Your enrollment code is: {{code}}",
  "verification_message": "Your verification code is: {{code}}"
}
```

## Get Factor Settings

```http
GET /api/v2/guardian/factors/{name}/settings
```

Retrieves settings for a specific factor.

### Parameters

| Parameter | Type   | Description                                                                                      |
| --------- | ------ | ------------------------------------------------------------------------------------------------ |
| name      | string | The name of the factor (sms, push-notification, email, otp, webauthn-roaming, webauthn-platform) |

### Response

```json
{
  "message": "{{code}} is your verification code for {{tenant.friendly_name}}",
  "provider": "twilio",
  "enrollment_message": "{{code}} is your verification code for {{tenant.friendly_name}}",
  "from": "+1234567890"
}
```

## Update Factor Settings

```http
PUT /api/v2/guardian/factors/{name}/settings
```

Updates settings for a specific factor.

### Parameters

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| name      | string | The name of the factor to update |

### Request Body

```json
{
  "message": "{{code}} is your verification code for {{tenant.friendly_name}}",
  "provider": "twilio",
  "enrollment_message": "{{code}} is your verification code for {{tenant.friendly_name}}",
  "from": "+1234567890"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid factor configuration",
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
  "message": "Factor not found",
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

1. **Factor Configuration**

   - Enable appropriate factors
   - Configure backup methods
   - Test enrollment process
   - Monitor factor usage

2. **Security**

   - Review factor settings
   - Monitor failed attempts
   - Configure rate limiting
   - Implement recovery options

3. **User Experience**
   - Clear enrollment instructions
   - Simple verification process
   - Multiple factor options
   - Easy recovery process

## Rate Limiting

The Guardian API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Available Factors

1. **Push Notifications**

   - Mobile app required
   - Secure and convenient
   - Real-time notifications
   - Device binding

2. **SMS**

   - Phone number required
   - Widely supported
   - Easy to use
   - Regional coverage

3. **Email**

   - Email address required
   - Backup method
   - Template customization
   - Delivery tracking

4. **OTP (One-Time Password)**

   - TOTP standard
   - Authenticator app
   - Offline support
   - Time-based codes

5. **WebAuthn**
   - Biometric support
   - Hardware tokens
   - Platform authenticators
   - FIDO2 compliance

### Template Variables

Available variables for SMS and email templates:

- `{{code}}`: Verification code
- `{{tenant.friendly_name}}`: Tenant name
- `{{enrollment.ticket}}`: Enrollment ticket
- `{{enrollment.url}}`: Enrollment URL
- `{{application.name}}`: Application name
- `{{guardian.factor}}`: Factor type
