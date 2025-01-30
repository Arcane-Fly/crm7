# Actions API

This document details the Actions endpoints in the Auth0 Management API.

## Get Actions

```http
GET /api/v2/actions
```

Retrieves a list of all actions.

### Query Parameters

| Parameter  | Type    | Description                   |
| ---------- | ------- | ----------------------------- |
| triggerId  | string  | Filter actions by trigger     |
| actionName | string  | Filter actions by name        |
| page       | number  | Page number (zero based)      |
| per_page   | number  | Number of results per page    |
| installed  | boolean | Return installed actions only |

### Response

```json
{
  "total": 1,
  "start": 0,
  "limit": 10,
  "actions": [
    {
      "id": "action_id",
      "name": "My Action",
      "supported_triggers": [
        {
          "id": "post-login",
          "version": "v2"
        }
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "code": "exports.onExecutePostLogin = async (event, api) => { }",
      "dependencies": [],
      "runtime": "node16",
      "status": "built",
      "secrets": []
    }
  ]
}
```

## Create Action

```http
POST /api/v2/actions
```

Creates a new action.

### Request Body

```json
{
  "name": "My Action",
  "supported_triggers": [
    {
      "id": "post-login",
      "version": "v2"
    }
  ],
  "code": "exports.onExecutePostLogin = async (event, api) => { }",
  "dependencies": [
    {
      "name": "lodash",
      "version": "4.17.21"
    }
  ],
  "runtime": "node16",
  "secrets": [
    {
      "name": "API_KEY",
      "value": "secret-value"
    }
  ]
}
```

### Response

```json
{
  "id": "action_id",
  "name": "My Action",
  "supported_triggers": [
    {
      "id": "post-login",
      "version": "v2"
    }
  ],
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "code": "exports.onExecutePostLogin = async (event, api) => { }",
  "dependencies": [
    {
      "name": "lodash",
      "version": "4.17.21"
    }
  ],
  "runtime": "node16",
  "status": "built",
  "secrets": [
    {
      "name": "API_KEY",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Get Action

```http
GET /api/v2/actions/{id}
```

Retrieves an action by ID.

### Parameters

| Parameter | Type   | Description                      |
| --------- | ------ | -------------------------------- |
| id        | string | The ID of the action to retrieve |

### Response

```json
{
  "id": "action_id",
  "name": "My Action",
  "supported_triggers": [
    {
      "id": "post-login",
      "version": "v2"
    }
  ],
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "code": "exports.onExecutePostLogin = async (event, api) => { }",
  "dependencies": [],
  "runtime": "node16",
  "status": "built",
  "secrets": []
}
```

## Update Action

```http
PATCH /api/v2/actions/{id}
```

Updates an existing action.

### Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| id        | string | The ID of the action to update |

### Request Body

```json
{
  "name": "Updated Action Name",
  "code": "exports.onExecutePostLogin = async (event, api) => { /* Updated code */ }",
  "dependencies": [
    {
      "name": "axios",
      "version": "0.24.0"
    }
  ],
  "secrets": [
    {
      "name": "NEW_SECRET",
      "value": "new-secret-value"
    }
  ]
}
```

### Response

```json
{
  "id": "action_id",
  "name": "Updated Action Name",
  "supported_triggers": [
    {
      "id": "post-login",
      "version": "v2"
    }
  ],
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "code": "exports.onExecutePostLogin = async (event, api) => { /* Updated code */ }",
  "dependencies": [
    {
      "name": "axios",
      "version": "0.24.0"
    }
  ],
  "runtime": "node16",
  "status": "built",
  "secrets": [
    {
      "name": "NEW_SECRET",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Delete Action

```http
DELETE /api/v2/actions/{id}
```

Deletes an action.

### Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| id        | string | The ID of the action to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Deploy Action

```http
POST /api/v2/actions/{id}/deploy
```

Deploys an action, making it available for execution.

### Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| id        | string | The ID of the action to deploy |

### Response

```json
{
  "id": "action_id",
  "status": "deployed",
  "deployed_version": {
    "code": "exports.onExecutePostLogin = async (event, api) => { }",
    "dependencies": [],
    "runtime": "node16",
    "status": "built"
  }
}
```

## Test Action

```http
POST /api/v2/actions/{id}/test
```

Tests an action with provided payload.

### Parameters

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| id        | string | The ID of the action to test |

### Request Body

```json
{
  "payload": {
    "event": {
      "user": {
        "email": "user@example.com"
      }
    }
  }
}
```

### Response

```json
{
  "results": {
    "response": {
      "user": {
        "email": "user@example.com",
        "metadata": {
          "customField": "value"
        }
      }
    },
    "logs": [
      {
        "level": "info",
        "message": "Action execution completed"
      }
    ]
  }
}
```

## Error Responses

Actions API endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid request body",
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
  "message": "Action not found",
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
