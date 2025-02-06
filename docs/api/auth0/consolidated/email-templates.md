# Email Templates API

This document details the Email Templates endpoints in the Auth0 Management API.

## Get Email Template

```http
GET /api/v2/email-templates/{templateName}
```

Retrieves an email template.

### Parameters

| Parameter    | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| templateName | string | The name of the template to retrieve |

### Response

```json
{
  "template": "verify_email",
  "body": "...",
  "from": "sender@auth0.com",
  "resultUrl": "https://example.com/verify-email",
  "subject": "Verify your email",
  "syntax": "liquid",
  "enabled": true,
  "includeEmailInRedirect": false
}
```

## Create Email Template

```http
POST /api/v2/email-templates
```

Creates an email template.

### Request Body

```json
{
  "template": "verify_email",
  "body": "...",
  "from": "sender@auth0.com",
  "resultUrl": "https://example.com/verify-email",
  "subject": "Verify your email",
  "syntax": "liquid",
  "enabled": true,
  "includeEmailInRedirect": false
}
```

### Response

```json
{
  "template": "verify_email",
  "body": "...",
  "from": "sender@auth0.com",
  "resultUrl": "https://example.com/verify-email",
  "subject": "Verify your email",
  "syntax": "liquid",
  "enabled": true,
  "includeEmailInRedirect": false
}
```

## Update Email Template

```http
PATCH /api/v2/email-templates/{templateName}
```

Updates an email template.

### Parameters

| Parameter    | Type   | Description                        |
| ------------ | ------ | ---------------------------------- |
| templateName | string | The name of the template to update |

### Request Body

```json
{
  "body": "...",
  "from": "new-sender@auth0.com",
  "resultUrl": "https://example.com/new-verify-email",
  "subject": "Please verify your email",
  "syntax": "liquid",
  "enabled": true,
  "includeEmailInRedirect": true
}
```

## Template Types

Available template types:

- `verify_email`: Email verification
- `welcome_email`: Welcome email
- `reset_email`: Password reset
- `blocked_account`: Blocked account notification
- `stolen_credentials`: Compromised credentials notification
- `enrollment_email`: MFA enrollment email
- `change_password`: Password change confirmation
- `password_reset`: Password reset request
- `mfa_oob_code`: MFA one-time password

## Template Variables

Common variables available in templates:

- `{{ application.name }}`: Application name
- `{{ user.email }}`: User's email
- `{{ user.username }}`: User's username
- `{{ user.nickname }}`: User's nickname
- `{{ user.given_name }}`: User's first name
- `{{ user.family_name }}`: User's last name
- `{{ user.connection }}`: Connection name
- `{{ url }}`: Action URL (e.g., verification link)

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid template configuration",
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
  "message": "Template not found",
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

1. **Template Design**

   - Use responsive email design
   - Test templates across email clients
   - Include plain text versions
   - Follow email best practices

2. **Content**

   - Use clear and concise language
   - Include company branding
   - Provide clear call-to-actions
   - Test all links and buttons

3. **Security**

   - Include anti-phishing measures
   - Add security disclaimers
   - Use HTTPS for all links
   - Implement SPF and DKIM

4. **Customization**
   - Use template variables appropriately
   - Test with different data scenarios
   - Consider internationalization
   - Maintain consistent branding

## Rate Limiting

The Email Templates API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Template Syntax

The template engine uses Liquid syntax. Common operations:

```liquid
{% if user.nickname %}
  Hello {{ user.nickname }}!
{% else %}
  Hello there!
{% endif %}

{% for item in items %}
  {{ item.name }}
{% endfor %}
```

### HTML Email Tips

1. **Structure**

   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <meta charset="utf-8" />
       <meta name="viewport" content="width=device-width" />
     </head>
     <body>
       <!-- Template content -->
     </body>
   </html>
   ```

2. **Inline CSS**

   - Use inline styles for better email client compatibility
   - Avoid external stylesheets
   - Test across different email clients

3. **Responsive Design**
   - Use tables for layout
   - Set max-width for content
   - Use media queries carefully
