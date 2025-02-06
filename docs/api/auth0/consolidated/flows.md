# Flows API

This document details the Flows endpoints in the Auth0 Management API.

## Get Flows

```http
GET /api/v2/flows
```

Retrieves all flows.

### Query Parameters

| Parameter      | Type    | Description                   |
| -------------- | ------- | ----------------------------- |
| page           | number  | Page number, zero based       |
| per_page       | number  | Number of results per page    |
| include_totals | boolean | Include total number of flows |

### Response

```json
{
  "flows": [
    {
      "id": "flow_123",
      "name": "Password Reset",
      "trigger": {
        "id": "post-login",
        "version": "v2"
      },
      "status": "active",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "start": 0,
  "limit": 10
}
```

## Create Flow

```http
POST /api/v2/flows
```

Creates a new flow.

### Request Body

```json
{
  "name": "Password Reset",
  "trigger": {
    "id": "post-login",
    "version": "v2"
  },
  "status": "active",
  "steps": [
    {
      "id": "step_1",
      "type": "condition",
      "options": {
        "expression": "user.email_verified === false"
      }
    },
    {
      "id": "step_2",
      "type": "action",
      "options": {
        "action_id": "action_123"
      }
    }
  ]
}
```

### Response

```json
{
  "id": "flow_123",
  "name": "Password Reset",
  "trigger": {
    "id": "post-login",
    "version": "v2"
  },
  "status": "active",
  "steps": [
    {
      "id": "step_1",
      "type": "condition",
      "options": {
        "expression": "user.email_verified === false"
      }
    },
    {
      "id": "step_2",
      "type": "action",
      "options": {
        "action_id": "action_123"
      }
    }
  ],
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Get Flow

```http
GET /api/v2/flows/{id}
```

Retrieves a flow by ID.

### Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| id        | string | The ID of the flow to retrieve |

### Response

```json
{
  "id": "flow_123",
  "name": "Password Reset",
  "trigger": {
    "id": "post-login",
    "version": "v2"
  },
  "status": "active",
  "steps": [
    {
      "id": "step_1",
      "type": "condition",
      "options": {
        "expression": "user.email_verified === false"
      }
    },
    {
      "id": "step_2",
      "type": "action",
      "options": {
        "action_id": "action_123"
      }
    }
  ],
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Update Flow

```http
PATCH /api/v2/flows/{id}
```

Updates a flow.

### Parameters

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| id        | string | The ID of the flow to update |

### Request Body

```json
{
  "name": "Updated Password Reset",
  "status": "inactive",
  "steps": [
    {
      "id": "step_1",
      "type": "condition",
      "options": {
        "expression": "user.email_verified === false && user.logins_count === 1"
      }
    }
  ]
}
```

## Delete Flow

```http
DELETE /api/v2/flows/{id}
```

Deletes a flow.

### Parameters

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| id        | string | The ID of the flow to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Flow Triggers

Available flow triggers:

- `post-login`: After user login
- `pre-user-registration`: Before user registration
- `post-user-registration`: After user registration
- `post-change-password`: After password change
- `send-phone-message`: When sending phone messages
- `credentials-exchange`: During credentials exchange

## Step Types

Available step types:

- `condition`: Evaluates an expression
- `action`: Executes an action
- `redirect`: Redirects to a URL
- `mfa`: Multi-factor authentication
- `email`: Sends an email
- `sms`: Sends an SMS

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid flow configuration",
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
  "message": "Flow not found",
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

1. **Flow Design**

   - Keep flows simple and focused
   - Use meaningful names
   - Document flow purpose
   - Test flows thoroughly

2. **Step Configuration**

   - Order steps logically
   - Handle errors gracefully
   - Use clear conditions
   - Monitor performance

3. **Maintenance**
   - Review flows regularly
   - Update outdated steps
   - Monitor flow execution
   - Document changes

## Rate Limiting

The Flows API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Flow Execution

1. **Trigger**

   - Event occurs
   - Flow is selected
   - Context is prepared

2. **Steps**

   - Execute in order
   - Can be conditional
   - May modify context
   - Can halt execution

3. **Completion**
   - Results collected
   - Logs generated
   - Metrics updated

### Flow Context

Available context properties:

- `user`: User information
- `client`: Application information
- `connection`: Connection information
- `request`: Request details
- `stats`: Statistics
- `configuration`: Flow configuration
