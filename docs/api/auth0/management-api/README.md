# Auth0 Management API Documentation

This document provides comprehensive documentation for the Auth0 Management API endpoints used in this application.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Endpoints](#api-endpoints)
  - [Actions](#actions)
  - [Anomaly Detection](#anomaly-detection)
  - [Attack Protection](#attack-protection)
  - [Branding](#branding)
  - [Client Grants](#client-grants)
  - [Clients](#clients)
  - [Connections](#connections)
  - [Device Credentials](#device-credentials)
  - [Email Templates](#email-templates)
  - [Email Provider](#email-provider)
  - [Enterprise](#enterprise)
  - [Flows](#flows)
  - [Forms](#forms)
  - [Grants](#grants)
  - [Guardian](#guardian)
  - [Hooks](#hooks)
  - [Jobs](#jobs)
  - [Keys](#keys)
  - [Log Streams](#log-streams)
  - [Logs](#logs)
  - [Organizations](#organizations)

## Authentication

All API requests must include an access token in the Authorization header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

To obtain an access token, you need to authenticate using your Auth0 credentials. See the [Auth0 Authentication guide](https://auth0.com/docs/api/authentication) for more details.

## Base URL

```
https://{YOUR_AUTH0_DOMAIN}/api/v2/
```

Replace `{YOUR_AUTH0_DOMAIN}` with your Auth0 domain (e.g., `your-tenant.auth0.com`).

## API Endpoints

### Actions

#### Get Actions
```http
GET /api/v2/actions
```

Retrieves a list of all actions.

**Query Parameters:**
- `triggerId` (optional): Filter actions by trigger
- `actionName` (optional): Filter actions by name
- `page` (optional): Page number, zero based
- `per_page` (optional): Number of results per page
- `installed` (optional): Return installed actions only

**Response:** List of action objects

#### Create Action
```http
POST /api/v2/actions
```

Creates a new action.

**Request Body:**
```json
{
  "name": "string",
  "supported_triggers": [
    {
      "id": "string",
      "version": "string"
    }
  ],
  "code": "string",
  "dependencies": [
    {
      "name": "string",
      "version": "string"
    }
  ],
  "runtime": "string",
  "secrets": [
    {
      "name": "string",
      "value": "string"
    }
  ]
}
```

**Response:** Created action object

### Anomaly Detection

#### Get Blocked IPs
```http
GET /api/v2/anomaly/blocks/ips/{id}
```

Retrieves blocked IP addresses.

#### Remove IP from Blocked IPs
```http
DELETE /api/v2/anomaly/blocks/ips/{id}
```

Removes an IP address from the blocked IPs list.

### Attack Protection

#### Get Breached Password Detection
```http
GET /api/v2/attack-protection/breached-password-detection
```

Retrieves the breached password detection settings.

#### Update Breached Password Detection
```http
PATCH /api/v2/attack-protection/breached-password-detection
```

Updates the breached password detection settings.

### Branding

#### Get Branding Settings
```http
GET /api/v2/branding
```

Retrieves the branding settings for your tenant.

#### Update Branding Settings
```http
PATCH /api/v2/branding
```

Updates the branding settings for your tenant.

### Client Grants

#### Get Client Grants
```http
GET /api/v2/client-grants
```

Retrieves all client grants.

#### Create Client Grant
```http
POST /api/v2/client-grants
```

Creates a new client grant.

### Clients (Applications)

#### Get Clients
```http
GET /api/v2/clients
```

Retrieves a list of all registered applications (clients).

#### Create Client
```http
POST /api/v2/clients
```

Creates a new application (client).

### Connections

#### Get Connections
```http
GET /api/v2/connections
```

Retrieves all connections.

#### Create Connection
```http
POST /api/v2/connections
```

Creates a new connection.

### Device Credentials

#### Get Device Credentials
```http
GET /api/v2/device-credentials
```

Retrieves device credentials.

### Email Templates

#### Get Email Template
```http
GET /api/v2/email-templates/{templateName}
```

Retrieves an email template.

### Email Provider

#### Get Email Provider
```http
GET /api/v2/emails/provider
```

Retrieves the email provider settings.

### Enterprise

#### Get Enterprise Connections
```http
GET /api/v2/enterprise
```

Retrieves enterprise connections.

### Organizations

#### Get Organizations
```http
GET /api/v2/organizations
```

Retrieves all organizations.

#### Create Organization
```http
POST /api/v2/organizations
```

Creates a new organization.

## Rate Limiting

The Auth0 Management API is subject to rate limiting. The specific limits depend on your subscription plan. Rate limit information is included in the response headers:

- `X-RateLimit-Limit`: Number of requests allowed per minute
- `X-RateLimit-Remaining`: Number of remaining requests in the current minute
- `X-RateLimit-Reset`: Time until the rate limit resets (in UTC epoch seconds)

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

Error responses include a JSON object with additional information:

```json
{
  "error": "error_code",
  "message": "Description of the error",
  "statusCode": 400
}
```

## Additional Resources

- [Auth0 Management API Explorer](https://auth0.com/docs/api/management/v2)
- [Auth0 Management API Documentation](https://auth0.com/docs/api/management/v2/tokens)
- [Rate Limits](https://auth0.com/docs/policies/rate-limits)
