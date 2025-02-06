# Organizations API

This document details the Organizations endpoints in the Auth0 Management API.

## Get Organizations

```http
GET /api/v2/organizations
```

Retrieves all organizations.

### Query Parameters

| Parameter      | Type    | Description                           |
| -------------- | ------- | ------------------------------------- |
| page           | number  | Page number, zero based               |
| per_page       | number  | Number of results per page            |
| include_totals | boolean | Include total number of organizations |
| from           | string  | Organization ID to start from         |
| take           | number  | Number of organizations to retrieve   |

### Response

```json
{
  "start": 0,
  "limit": 50,
  "total": 1,
  "organizations": [
    {
      "id": "org_123",
      "name": "my-organization",
      "display_name": "My Organization",
      "branding": {
        "logo_url": "https://example.com/logo.png",
        "colors": {
          "primary": "#000000",
          "page_background": "#ffffff"
        }
      },
      "metadata": {
        "key": "value"
      },
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Create Organization

```http
POST /api/v2/organizations
```

Creates a new organization.

### Request Body

```json
{
  "name": "my-organization",
  "display_name": "My Organization",
  "branding": {
    "logo_url": "https://example.com/logo.png",
    "colors": {
      "primary": "#000000",
      "page_background": "#ffffff"
    }
  },
  "metadata": {
    "key": "value"
  }
}
```

### Response

```json
{
  "id": "org_123",
  "name": "my-organization",
  "display_name": "My Organization",
  "branding": {
    "logo_url": "https://example.com/logo.png",
    "colors": {
      "primary": "#000000",
      "page_background": "#ffffff"
    }
  },
  "metadata": {
    "key": "value"
  },
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Get Organization

```http
GET /api/v2/organizations/{id}
```

Retrieves an organization by ID.

### Parameters

| Parameter | Type   | Description                            |
| --------- | ------ | -------------------------------------- |
| id        | string | The ID of the organization to retrieve |

### Response

```json
{
  "id": "org_123",
  "name": "my-organization",
  "display_name": "My Organization",
  "branding": {
    "logo_url": "https://example.com/logo.png",
    "colors": {
      "primary": "#000000",
      "page_background": "#ffffff"
    }
  },
  "metadata": {
    "key": "value"
  },
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Update Organization

```http
PATCH /api/v2/organizations/{id}
```

Updates an organization.

### Parameters

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| id        | string | The ID of the organization to update |

### Request Body

```json
{
  "display_name": "Updated Organization Name",
  "branding": {
    "colors": {
      "primary": "#0000ff"
    }
  },
  "metadata": {
    "new_key": "new_value"
  }
}
```

## Delete Organization

```http
DELETE /api/v2/organizations/{id}
```

Deletes an organization.

### Parameters

| Parameter | Type   | Description                          |
| --------- | ------ | ------------------------------------ |
| id        | string | The ID of the organization to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Organization Members

### Get Members

```http
GET /api/v2/organizations/{id}/members
```

Retrieves the members of an organization.

### Add Members

```http
POST /api/v2/organizations/{id}/members
```

Adds members to an organization.

### Request Body

```json
{
  "members": ["user_id_1", "user_id_2"]
}
```

### Delete Members

```http
DELETE /api/v2/organizations/{id}/members
```

Removes members from an organization.

### Request Body

```json
{
  "members": ["user_id_1", "user_id_2"]
}
```

## Organization Roles

### Get Member Roles

```http
GET /api/v2/organizations/{id}/members/{user_id}/roles
```

Retrieves the roles assigned to a member.

### Assign Roles

```http
POST /api/v2/organizations/{id}/members/{user_id}/roles
```

Assigns roles to a member.

### Request Body

```json
{
  "roles": ["role_id_1", "role_id_2"]
}
```

### Remove Roles

```http
DELETE /api/v2/organizations/{id}/members/{user_id}/roles
```

Removes roles from a member.

### Request Body

```json
{
  "roles": ["role_id_1", "role_id_2"]
}
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid organization configuration",
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
  "message": "Organization not found",
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

1. **Organization Management**

   - Use meaningful names
   - Document organization purpose
   - Maintain member list
   - Review permissions regularly

2. **Security**

   - Implement role-based access
   - Monitor member activity
   - Regular access reviews
   - Secure sensitive data

3. **Operations**
   - Plan organization structure
   - Document procedures
   - Monitor usage
   - Regular maintenance

## Rate Limiting

The Organizations API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Organization Structure

1. **Members**

   - Users belong to organization
   - Can have multiple roles
   - Access organization resources
   - Subject to organization rules

2. **Roles**

   - Define permissions
   - Assigned to members
   - Control access levels
   - Can be customized

3. **Connections**
   - Authentication methods
   - Identity providers
   - Social connections
   - Enterprise connections

### Organization Settings

Example organization configuration:

```json
{
  "settings": {
    "session_lifetime": 168,
    "idle_session_lifetime": 72,
    "enable_sso": true,
    "require_mfa": true,
    "mfa_remember_browser_lifetime": 30,
    "allowed_logout_urls": ["https://example.com/logout"],
    "allowed_callback_urls": ["https://example.com/callback"]
  }
}
```
