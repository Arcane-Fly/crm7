# Fair Work API Documentation

## Overview

The Fair Work API provides endpoints for accessing award rates, classifications, penalties, allowances, and leave entitlements from the Fair Work system. This API is designed to help businesses comply with Australian workplace laws and regulations.

## Base URL

```
/api/fairwork
```

## Authentication

All endpoints require authentication. Include your authentication token in the request headers:

```typescript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN'
}
```

## Endpoints

### Awards

#### Search Awards
```http
GET /api/fairwork/awards
```

Query Parameters:
- `query` (optional): Search term
- `industry` (optional): Industry filter
- `occupation` (optional): Occupation filter
- `page` (optional): Page number
- `limit` (optional): Results per page

Response:
```typescript
{
  items: Array<{
    code: string;
    name: string;
    industry?: string;
    occupation?: string;
  }>;
  total: number;
}
```

#### Get Award Details
```http
GET /api/fairwork/[awardCode]
```

Response:
```typescript
{
  code: string;
  name: string;
  industry?: string;
  occupation?: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}
```

### Classifications

#### Get Classification Details
```http
GET /api/fairwork/[awardCode]/[classificationCode]
```

Response:
```typescript
{
  code: string;
  name: string;
  level: string;
  description?: string;
  minimumRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
}
```

#### Get Pay Rates
```http
GET /api/fairwork/[awardCode]/[classificationCode]/rates
```

Query Parameters:
- `date` (optional): Effective date
- `employmentType` (optional): 'casual' | 'permanent' | 'fixed-term'

Response:
```typescript
{
  baseRate: number;
  casualLoading?: number;
  total: number;
  effectiveFrom: string;
  effectiveTo?: string;
}
```

### Rate History & Validation

#### Get Rate History
```http
GET /api/fairwork/[awardCode]/[classificationCode]/history
```

Query Parameters:
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)

Response:
```typescript
{
  rates: Array<{
    date: string;
    baseRate: number;
    casualLoading?: number;
    total: number;
  }>;
}
```

#### Get Future Rates
```http
GET /api/fairwork/[awardCode]/[classificationCode]/future
```

Query Parameters:
- `fromDate`: Start date (YYYY-MM-DD)

Response:
```typescript
{
  rates: Array<{
    date: string;
    baseRate: number;
    casualLoading?: number;
    total: number;
  }>;
}
```

#### Validate Pay Rate
```http
POST /api/fairwork/[awardCode]/[classificationCode]/validate
```

Request Body:
```typescript
{
  rate: number;
  date: string; // YYYY-MM-DD
  employmentType: 'casual' | 'permanent' | 'fixed-term';
}
```

Response:
```typescript
{
  isValid: boolean;
  minimumRate: number;
  difference: number;
  message?: string;
}
```

### Penalties & Allowances

#### Get Penalties
```http
GET /api/fairwork/[awardCode]/penalties
```

Query Parameters:
- `date` (optional): Effective date
- `type` (optional): Penalty type

Response:
```typescript
Array<{
  code: string;
  rate: number;
  description: string;
  type?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}>
```

#### Get Allowances
```http
GET /api/fairwork/[awardCode]/allowances
```

Query Parameters:
- `date` (optional): Effective date
- `type` (optional): Allowance type

Response:
```typescript
Array<{
  code: string;
  amount: number;
  description: string;
  type?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}>
```

### Leave Entitlements

#### Get Leave Entitlements
```http
GET /api/fairwork/[awardCode]/leave-entitlements
```

Query Parameters:
- `employmentType`: 'casual' | 'permanent' | 'fixed-term'
- `date` (optional): Effective date

Response:
```typescript
Array<{
  type: string;
  amount: number;
  unit: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
}>
```

## Error Handling

The API uses standard HTTP status codes and returns error responses in the following format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

Common error codes:
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error

## Rate Limiting

The API implements rate limiting to ensure fair usage. Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Versioning

The API is versioned through the URL path. The current version is v1:

```
/api/fairwork/v1/...
```

## Best Practices

1. Always specify dates in ISO 8601 format (YYYY-MM-DD)
2. Cache responses when appropriate
3. Implement proper error handling
4. Use appropriate employment types
5. Validate rates before applying them
6. Monitor rate limit headers

## Support

For API support or questions, please contact:
- Email: support@crm7.dev
- Documentation: https://docs.crm7.dev/api/fairwork
