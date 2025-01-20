# Forms API

This document details the Forms endpoints in the Auth0 Management API.

## Get Forms

```http
GET /api/v2/forms
```

Retrieves all forms.

### Query Parameters

| Parameter      | Type    | Description                   |
| -------------- | ------- | ----------------------------- |
| page           | number  | Page number, zero based       |
| per_page       | number  | Number of results per page    |
| include_totals | boolean | Include total number of forms |

### Response

```json
{
  "forms": [
    {
      "id": "form_123",
      "name": "User Registration",
      "type": "signup",
      "fields": [
        {
          "name": "given_name",
          "label": "First Name",
          "type": "text",
          "required": true
        },
        {
          "name": "family_name",
          "label": "Last Name",
          "type": "text",
          "required": true
        }
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "start": 0,
  "limit": 10
}
```

## Create Form

```http
POST /api/v2/forms
```

Creates a new form.

### Request Body

```json
{
  "name": "User Registration",
  "type": "signup",
  "fields": [
    {
      "name": "given_name",
      "label": "First Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your first name"
    },
    {
      "name": "family_name",
      "label": "Last Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your last name"
    },
    {
      "name": "company",
      "label": "Company",
      "type": "text",
      "required": false,
      "placeholder": "Enter your company name"
    }
  ],
  "settings": {
    "show_labels": true,
    "submit_button_text": "Register",
    "success_message": "Registration successful!"
  }
}
```

### Response

```json
{
  "id": "form_123",
  "name": "User Registration",
  "type": "signup",
  "fields": [
    {
      "name": "given_name",
      "label": "First Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your first name"
    },
    {
      "name": "family_name",
      "label": "Last Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your last name"
    },
    {
      "name": "company",
      "label": "Company",
      "type": "text",
      "required": false,
      "placeholder": "Enter your company name"
    }
  ],
  "settings": {
    "show_labels": true,
    "submit_button_text": "Register",
    "success_message": "Registration successful!"
  },
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Get Form

```http
GET /api/v2/forms/{id}
```

Retrieves a form by ID.

### Parameters

| Parameter | Type   | Description                    |
| --------- | ------ | ------------------------------ |
| id        | string | The ID of the form to retrieve |

### Response

```json
{
  "id": "form_123",
  "name": "User Registration",
  "type": "signup",
  "fields": [
    {
      "name": "given_name",
      "label": "First Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your first name"
    },
    {
      "name": "family_name",
      "label": "Last Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your last name"
    }
  ],
  "settings": {
    "show_labels": true,
    "submit_button_text": "Register",
    "success_message": "Registration successful!"
  },
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

## Update Form

```http
PATCH /api/v2/forms/{id}
```

Updates a form.

### Parameters

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| id        | string | The ID of the form to update |

### Request Body

```json
{
  "name": "Updated Registration Form",
  "fields": [
    {
      "name": "given_name",
      "label": "First Name",
      "type": "text",
      "required": true,
      "placeholder": "Enter your first name"
    },
    {
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "required": true,
      "placeholder": "Enter your email"
    }
  ],
  "settings": {
    "submit_button_text": "Sign Up"
  }
}
```

## Delete Form

```http
DELETE /api/v2/forms/{id}
```

Deletes a form.

### Parameters

| Parameter | Type   | Description                  |
| --------- | ------ | ---------------------------- |
| id        | string | The ID of the form to delete |

### Response

A successful deletion returns a 204 No Content status with no response body.

## Form Types

Available form types:

- `signup`: User registration
- `login`: User login
- `reset-password`: Password reset
- `mfa-enrollment`: Multi-factor authentication enrollment
- `user-profile`: User profile update
- `consent`: User consent
- `invitation`: User invitation

## Field Types

Available field types:

- `text`: Text input
- `email`: Email input
- `password`: Password input
- `number`: Number input
- `tel`: Telephone input
- `select`: Dropdown select
- `checkbox`: Checkbox input
- `radio`: Radio button input
- `textarea`: Multi-line text input
- `date`: Date input
- `file`: File upload

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid form configuration",
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
  "message": "Form not found",
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

1. **Form Design**

   - Keep forms simple and focused
   - Use clear labels
   - Provide helpful placeholders
   - Implement validation

2. **Field Configuration**

   - Group related fields
   - Use appropriate field types
   - Mark required fields
   - Add field descriptions

3. **User Experience**
   - Show validation errors
   - Preserve form data
   - Enable auto-complete
   - Support keyboard navigation

## Rate Limiting

The Forms API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Additional Information

### Field Validation

Common validation rules:

```json
{
  "validation": {
    "min_length": 2,
    "max_length": 50,
    "pattern": "^[a-zA-Z ]+$",
    "error_message": "Please enter a valid name"
  }
}
```

### Field Dependencies

Example of conditional fields:

```json
{
  "dependencies": {
    "show_if": {
      "field": "account_type",
      "equals": "business"
    }
  }
}
```

### Custom Styling

Example of field styling:

```json
{
  "style": {
    "width": "100%",
    "margin_bottom": "1rem",
    "border_radius": "4px",
    "border_color": "#ccc"
  }
}
```
