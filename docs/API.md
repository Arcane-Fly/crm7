# API Documentation

## Overview

CRM7's API is built using Next.js API routes, providing RESTful endpoints for managing various aspects of the CRM system. All API routes are prefixed with `/api/`.

## Authentication

All API endpoints require authentication using Auth0. Include the authentication token in the request headers:

```http
Authorization: Bearer <your_access_token>
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user
- Bulk operations limited to 100 items per request

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2025-01-22T07:35:37Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2025-01-22T07:35:37Z"
}
```

## API Endpoints

### Rate Management

#### Get Rate Templates

```http
GET /api/rates/templates
```

Query Parameters:

- `org_id` (required): Organization ID
- `status` (optional): Filter by status (active/inactive)

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "baseRate": "number",
      "multipliers": {
        "weekend": "number",
        "holiday": "number"
      },
      "status": "string"
    }
  ]
}
```

#### Create Rate Template

```http
POST /api/rates/templates
```

Request Body:

```json
{
  "name": "string",
  "orgId": "string",
  "baseRate": "number",
  "multipliers": {
    "weekend": "number",
    "holiday": "number"
  },
  "status": "active|inactive"
}
```

#### Update Rate Template

```http
PUT /api/rates/templates/{templateId}
```

Request Body:

```json
{
  "name": "string",
  "baseRate": "number",
  "multipliers": {
    "weekend": "number",
    "holiday": "number"
  },
  "status": "active|inactive"
}
```

#### Delete Rate Template

```http
DELETE /api/rates/templates/{templateId}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "deletedAt": "string"
  }
}
```

#### Calculate Charge Rate

```http
POST /api/charge-rates/calculate
```

Request Body:

```json
{
  "rateId": "string",
  "hours": "number",
  "date": "string",
  "type": "regular|overtime|holiday"
}
```

### HR Management

#### Get Employee Profile

```http
GET /api/hr/employees/{employeeId}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "department": "string",
    "status": "string"
  }
}
```

#### Update Employee Status

```http
PATCH /api/hr/employees/{employeeId}/status
```

Request Body:

```json
{
  "status": "active|inactive|suspended",
  "reason": "string"
}
```

### Analytics

#### Get HR Dashboard Data

```http
GET /api/analytics/hr-dashboard
```

Query Parameters:

- `startDate` (required): ISO date string
- `endDate` (required): ISO date string
- `department` (optional): Filter by department

Response:

```json
{
  "success": true,
  "data": {
    "totalEmployees": "number",
    "activeEmployees": "number",
    "departmentBreakdown": [
      {
        "department": "string",
        "count": "number"
      }
    ],
    "trends": {
      "hiring": [],
      "turnover": []
    }
  }
}
```

## Error Codes

| Code             | Description                        |
| ---------------- | ---------------------------------- |
| `AUTH_REQUIRED`  | Authentication required            |
| `AUTH_INVALID`   | Invalid authentication credentials |
| `RATE_LIMIT`     | Rate limit exceeded                |
| `INVALID_INPUT`  | Invalid input parameters           |
| `NOT_FOUND`      | Resource not found                 |
| `FORBIDDEN`      | Insufficient permissions           |
| `INTERNAL_ERROR` | Internal server error              |

## Versioning

The API is versioned using URL path versioning. The current version is v1:

```http
/api/v1/resource
```

## Rate Limiting Headers

Response headers include rate limit information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1643673337
```

## Pagination

For endpoints returning lists, use the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": "number",
    "pages": "number",
    "current": "number",
    "limit": "number"
  }
}
```

## CORS

CORS is enabled for all API endpoints. The following origins are allowed:

- Development: `http://localhost:4200`
- Production: `https://crm7.example.com`

## API Clients

### TypeScript/JavaScript

```typescript
import { createClient } from '@/lib/api-client';

const client = createClient({
  baseURL: '/api',
  token: 'your_access_token',
});

// Example usage
const rates = await client.rates.getTemplates({
  org_id: 'org_123',
});
```

## Webhooks

Webhooks are available for real-time notifications. Configure webhook endpoints in the dashboard:

```http
POST https://your-endpoint.com/webhook
```

Payload:

```json
{
  "event": "string",
  "data": {},
  "timestamp": "string"
}
```

## Best Practices

1. **Rate Limiting**

   - Implement exponential backoff
   - Cache responses when possible

2. **Error Handling**

   - Always check for error responses
   - Implement proper retry logic

3. **Security**

   - Never expose tokens in client-side code
   - Validate all input parameters

4. **Performance**
   - Use compression for large responses
   - Implement request batching for bulk operations

---

Last Updated: 2025-01-22
