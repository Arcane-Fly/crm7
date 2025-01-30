# Branding API

This document details the Branding endpoints in the Auth0 Management API.

## Get Branding Settings

```http
GET /api/v2/branding
```

Retrieves the branding settings for your tenant.

### Response

```json
{
  "colors": {
    "primary": "#0059d6",
    "page_background": "#000000"
  },
  "favicon_url": "https://example.com/favicon.ico",
  "logo_url": "https://example.com/logo.png",
  "font": {
    "url": "https://example.com/font.woff"
  }
}
```

## Update Branding Settings

```http
PATCH /api/v2/branding
```

Updates the branding settings for your tenant.

### Request Body

```json
{
  "colors": {
    "primary": "#0059d6",
    "page_background": "#000000"
  },
  "favicon_url": "https://example.com/favicon.ico",
  "logo_url": "https://example.com/logo.png",
  "font": {
    "url": "https://example.com/font.woff"
  }
}
```

## Universal Login Template

### Get Template

```http
GET /api/v2/branding/templates/universal-login
```

Retrieves the custom Universal Login template.

### Response

```json
{
  "template": "<!DOCTYPE html><html>...</html>",
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

### Set Template

```http
PUT /api/v2/branding/templates/universal-login
```

Sets the custom Universal Login template.

#### Request Body

```json
{
  "template": "<!DOCTYPE html><html>...</html>"
}
```

### Delete Template

```http
DELETE /api/v2/branding/templates/universal-login
```

Deletes the custom Universal Login template.

## Themes

### Create Theme

```http
POST /api/v2/branding/themes
```

Creates a new theme.

#### Request Body

```json
{
  "displayName": "My Custom Theme",
  "borders": {
    "button_border_radius": 3,
    "button_border_weight": 1,
    "buttons_style": "rounded",
    "input_border_radius": 3,
    "input_border_weight": 1,
    "inputs_style": "rounded",
    "show_widget_shadow": true,
    "widget_border_weight": 1,
    "widget_corner_radius": 5
  },
  "colors": {
    "base_focus_color": "#635dff",
    "base_hover_color": "#635dff",
    "body_text": "#1e212a",
    "error": "#d03c38",
    "header": "#1e212a",
    "icons": "#65676e",
    "input_background": "#ffffff",
    "input_border": "#c9cace",
    "input_filled_text": "#1e212a",
    "input_labels_placeholders": "#65676e",
    "links_focused_components": "#635dff",
    "primary_button": "#635dff",
    "primary_button_label": "#ffffff",
    "secondary_button_border": "#c9cace",
    "secondary_button_label": "#1e212a",
    "success": "#13a688",
    "widget_background": "#ffffff",
    "widget_border": "#c9cace"
  },
  "fonts": {
    "body_text": {
      "bold": false,
      "size": 14
    },
    "buttons_text": {
      "bold": true,
      "size": 14
    },
    "font_url": "https://example.com/font.woff2",
    "input_labels": {
      "bold": true,
      "size": 14
    },
    "links": {
      "bold": false,
      "size": 14
    },
    "reference_text_size": 16,
    "subtitle": {
      "bold": false,
      "size": 14
    },
    "title": {
      "bold": true,
      "size": 24
    }
  },
  "page_background": {
    "background_color": "#000000",
    "background_image_url": "https://example.com/background.jpg"
  },
  "widget": {
    "header_text_alignment": "center",
    "logo_height": 50,
    "logo_position": "center",
    "logo_url": "https://example.com/logo.png",
    "social_buttons_layout": "top"
  }
}
```

### Get Theme

```http
GET /api/v2/branding/themes/{id}
```

Retrieves a theme by ID.

### Update Theme

```http
PATCH /api/v2/branding/themes/{id}
```

Updates an existing theme.

### Delete Theme

```http
DELETE /api/v2/branding/themes/{id}
```

Deletes a theme.

## Error Responses

### 400 Bad Request

```json
{
  "error": "bad_request",
  "message": "Invalid theme configuration",
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
  "message": "Theme not found",
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

1. **Theme Management**

   - Test themes in a development environment first
   - Keep a backup of working themes
   - Document theme changes and versioning

2. **Asset Management**

   - Use CDN-hosted assets for better performance
   - Optimize image sizes
   - Ensure font files are properly licensed

3. **Responsive Design**
   - Test themes across different devices and screen sizes
   - Consider mobile-first design principles
   - Maintain consistent branding across all views

## Rate Limiting

The Branding API endpoints are subject to rate limiting:

- Default: 50 requests per minute
- Enterprise: 100 requests per minute

Rate limit information is included in the response headers:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
