# Jobs API

This document details the Jobs endpoints in the Auth0 Management API.

## Get Job

```http
GET /api/v2/jobs/{id}
```

Retrieves a job by ID.

### Parameters

| Parameter | Type   | Description                   |
| --------- | ------ | ----------------------------- |
| id        | string | The ID of the job to retrieve |

### Response

```json
{
  "id": "job_123",
  "type": "verification_email",
  "status": "completed",
  "created_at": "2023-01-01T00:00:00.000Z",
  "percentage_done": 100
}
```

## Get Failed Job Errors

```http
GET /api/v2/jobs/{id}/errors
```

Retrieves error details for a failed job.

### Parameters

| Parameter | Type   | Description              |
| --------- | ------ | ------------------------ |
| id        | string | The ID of the failed job |

### Response

```json
{
  "errors": [
    {
      "user_id": "user_123",
      "error": "Invalid email format",
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Export Users

```http
POST /api/v2/jobs/users-exports
```

Creates a job to export users to a file.

### Request Body

```json
{
  "connection_id": "con_123",
  "format": "json",
  "limit": 5000,
  "fields": [
    {
      "name": "user_id"
    },
    {
      "name": "email"
    },
    {
      "name": "created_at"
    }
  ]
}
```

### Response

```json
{
  "id": "job_123",
  "type": "users_export",
  "status": "pending",
  "created_at": "2023-01-01T00:00:00.000Z",
  "connection_id": "con_123",
  "format": "json",
  "limit": 5000
}
```

## Import Users

```http
POST /api/v2/jobs/users-imports
```

Creates a job to import users from a file.

### Request Body (multipart/form-data)

| Parameter     | Type    | Description                        |
| ------------- | ------- | ---------------------------------- |
| users         | file    | JSON/CSV file containing user data |
| connection_id | string  | Connection ID to import users to   |
| upsert        | boolean | Whether to update existing users   |

### Response

```json
{
  "id": "job_123",
  "type": "users_import",
  "status": "pending",
  "created_at": "2023-01-01T00:00:00.000Z",
  "connection_id": "con_123"
}
```

## Send Verification Email

```http
POST /api/v2/jobs/verification-email
```

Creates a job to send verification emails.

### Request Body

```json
{
  "user_id": "user_123",
  "client_id": "client_123"
}
```

### Response

```json
{
  "id": "job_123",
  "type": "verification_email",
  "status": "pending",
  "created_at": "2023-01-01T00:00:00.000Z"
}
```

## Job Types

Available job types:

- `verification_email`: Send verification emails
- `users_export`: Export users to file
- `users_import`: Import users from file
- `users_delete`: Delete users
- `stats_export`: Export statistics

## Job Statuses

Possible job statuses:

- `pending`: Job is queued
- `processing`: Job is running
- `completed`: Job completed successfully
- `failed`: Job failed with errors
- `cancelled`: Job was cancelled

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid job configuration",
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
  "message": "Job not found",
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

1. **Job Management**

   - Monitor job status
   - Handle failures gracefully
   - Implement retries
   - Archive job results

2. **Performance**

   - Use appropriate limits
   - Schedule large jobs
   - Monitor resource usage
   - Handle timeouts

3. **Data Handling**
   - Validate input data
   - Handle large files
   - Backup before imports
   - Verify results

## Rate Limiting

The Jobs API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Export Format

Example JSON export format:

```json
{
  "users": [
    {
      "user_id": "auth0|123",
      "email": "user@example.com",
      "created_at": "2023-01-01T00:00:00.000Z",
      "identities": [
        {
          "provider": "auth0",
          "user_id": "123",
          "connection": "Username-Password-Authentication"
        }
      ]
    }
  ]
}
```

### Import Format

Example JSON import format:

```json
{
  "users": [
    {
      "email": "user@example.com",
      "given_name": "John",
      "family_name": "Smith",
      "password": "secret",
      "user_metadata": {
        "plan": "premium"
      },
      "app_metadata": {
        "roles": ["admin"]
      }
    }
  ]
}
```

### Job Monitoring

Best practices for monitoring jobs:

1. Poll job status periodically
2. Implement exponential backoff
3. Set appropriate timeouts
4. Handle all possible statuses
5. Log job progress
6. Alert on failures
7. Archive job results
8. Clean up temporary files
