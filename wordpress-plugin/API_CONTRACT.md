# Form Builder API Contract

Complete specification of all REST API endpoints provided by the Form Builder WordPress plugin.

## Base URL

```
/wp-json/form-builder/v1
```

All endpoints are relative to this base URL.

## Authentication

### Admin Endpoints (CRUD Operations)

**Required Headers:**
```
X-WP-Nonce: {nonce}
Cookie: {WordPress session cookie}
```

The nonce is provided automatically when the React app is served through WordPress via `wp_localize_script()`.

**Alternative (for external clients):**
```
Authorization: Bearer {WordPress JWT token}
```

### Public Endpoints

No authentication required. However, CORS restrictions may apply depending on WordPress configuration.

## Request/Response Format

All requests and responses use `application/json` content type.

### Error Response Format

```json
{
  "code": "error_code",
  "message": "Human readable error message",
  "data": {
    "status": 400
  }
}
```

### Success Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

## Forms Endpoints

### GET /forms

List all forms (admin only).

**Permission:** Requires authentication and `manage_options` capability

**Query Parameters:**
None

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Contact Form",
      "slug": "contact-form",
      "schema": {
        "steps": [],
        "components": []
      },
      "created_at": "2024-01-01 12:00:00",
      "updated_at": "2024-01-01 12:00:00",
      "deleted_at": null
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `403 Forbidden` - Not authenticated or insufficient permissions
- `401 Unauthorized` - Invalid nonce

---

### GET /forms/{id}

Get a single form by ID (admin only).

**Permission:** Requires authentication and `manage_options` capability

**Path Parameters:**
- `id` (integer, required) - Form ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Contact Form",
    "slug": "contact-form",
    "schema": {
      "steps": [],
      "components": []
    },
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00",
    "deleted_at": null
  }
}
```

**Error Responses:**
- `404 Not Found` - Form not found
- `403 Forbidden` - Not authenticated or insufficient permissions

---

### GET /forms/slug/{slug}

Get a single form by slug (public endpoint).

**Permission:** None required

**Path Parameters:**
- `slug` (string, required) - Form slug (URL-friendly identifier)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Contact Form",
    "slug": "contact-form",
    "schema": {
      "steps": [],
      "components": []
    },
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00",
    "deleted_at": null
  }
}
```

**Error Responses:**
- `404 Not Found` - Form not found

**Example:**
```bash
curl https://example.com/wp-json/form-builder/v1/forms/slug/contact-form
```

---

### POST /forms

Create a new form (admin only).

**Permission:** Requires authentication and `manage_options` capability

**Request Body:**
```json
{
  "title": "Contact Form",
  "slug": "contact-form",
  "schema": {
    "steps": [
      {
        "id": "step-1",
        "title": "Step 1",
        "order": 1
      }
    ],
    "components": [
      {
        "id": "field-1",
        "type": "text",
        "props": {
          "label": "Name",
          "name": "name",
          "required": true
        },
        "order": 1,
        "stepId": "step-1"
      }
    ]
  }
}
```

**Validation Rules:**
- `title` (string, required) - Max 255 characters
- `slug` (string, required) - Must be unique, alphanumeric + hyphens
- `schema` (object, required) - Must contain `steps` and `components` arrays

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Contact Form",
    "slug": "contact-form",
    "schema": { ... },
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00",
    "deleted_at": null
  },
  "message": "Form created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid fields
  ```json
  {
    "code": "invalid_data",
    "message": "Missing required fields: title, slug, schema"
  }
  ```
- `409 Conflict` - Slug already exists
- `403 Forbidden` - Not authenticated or insufficient permissions

**Example:**
```bash
curl -X POST https://example.com/wp-json/form-builder/v1/forms \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: $NONCE" \
  -d '{
    "title": "Newsletter Signup",
    "slug": "newsletter",
    "schema": { ... }
  }' \
  --cookie "wordpress_session=$SESSION"
```

---

### POST /forms/{id}

Update a form (admin only).

**Permission:** Requires authentication and `manage_options` capability

**Path Parameters:**
- `id` (integer, required) - Form ID

**Request Body:**
```json
{
  "title": "Updated Form Title",
  "schema": {
    "steps": [],
    "components": []
  }
}
```

**Validation Rules:**
- `title` (string, required) - Max 255 characters
- `schema` (object, required) - Must contain `steps` and `components` arrays

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Updated Form Title",
    "slug": "contact-form",
    "schema": { ... },
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:30:00",
    "deleted_at": null
  },
  "message": "Form updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid fields
- `404 Not Found` - Form not found
- `403 Forbidden` - Not authenticated or insufficient permissions

---

### DELETE /forms/{id}

Delete a form (soft delete, admin only).

**Permission:** Requires authentication and `manage_options` capability

**Path Parameters:**
- `id` (integer, required) - Form ID

**Response (200):**
```json
{
  "success": true,
  "message": "Form deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Form not found
- `403 Forbidden` - Not authenticated or insufficient permissions

**Note:** Forms are soft-deleted (marked as deleted but data retained for historical records).

---

## Submissions Endpoints

### POST /submissions

Create a new form submission (public endpoint).

**Permission:** None required

**Request Body:**
```json
{
  "form_id": 1,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }
}
```

**Validation Rules:**
- `form_id` (integer, required) - Must reference an existing, non-deleted form
- `data` (object, required) - Must be non-empty object with field values

**Response (201):**
```json
{
  "success": true,
  "submission_id": 42,
  "message": "Submission received successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid fields
  ```json
  {
    "code": "invalid_data",
    "message": "Missing required fields: form_id, data"
  }
  ```
- `404 Not Found` - Form not found
  ```json
  {
    "code": "form_not_found",
    "message": "Form not found"
  }
  ```

**Notes:**
- Automatically captures client IP address
- Automatically captures user agent
- Captures user ID if user is logged in
- Triggers `form_builder_submission_created` action
- Email notification sent if enabled

**Example:**
```javascript
const response = await fetch('/wp-json/form-builder/v1/submissions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    form_id: 1,
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    }
  })
});

const result = await response.json();
console.log(result.submission_id); // 42
```

---

### GET /forms/{form_id}/submissions

Get submissions for a form (admin only).

**Permission:** Requires authentication and `manage_options` capability

**Path Parameters:**
- `form_id` (integer, required) - Form ID

**Query Parameters:**
- `limit` (integer, optional, default: 100) - Max 500 results per request
- `offset` (integer, optional, default: 0) - For pagination

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "form_id": 1,
      "data": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "user_id": null,
      "created_at": "2024-01-01 13:00:00"
    }
  ],
  "count": 1,
  "pagination": {
    "limit": 100,
    "offset": 0
  }
}
```

**Error Responses:**
- `404 Not Found` - Form not found
- `403 Forbidden` - Not authenticated or insufficient permissions

**Example:**
```bash
curl "https://example.com/wp-json/form-builder/v1/forms/1/submissions?limit=50&offset=0" \
  -H "X-WP-Nonce: $NONCE" \
  --cookie "wordpress_session=$SESSION"
```

---

## Data Types

### Form Object

```typescript
{
  id: number;
  title: string;
  slug: string;
  schema: FormSchema;
  created_at: string; // "2024-01-01 12:00:00"
  updated_at: string; // "2024-01-01 12:00:00"
  deleted_at: string | null; // "2024-01-01 12:30:00" or null
}
```

### FormSchema Object

```typescript
{
  steps: FormStep[];
  components: Component[];
}
```

### FormStep Object

```typescript
{
  id: string;
  title: string;
  order: number;
}
```

### Component Object

```typescript
{
  id: string;
  type: string; // "text", "email", "textarea", "select", etc.
  props: Record<string, unknown>;
  order: number;
  stepId?: string;
  children?: string[];
}
```

### Submission Object

```typescript
{
  id: number;
  form_id: number;
  data: Record<string, unknown>;
  ip_address: string; // "192.168.1.100"
  user_agent: string;
  user_id: number | null;
  created_at: string; // "2024-01-01 13:00:00"
}
```

---

## Status Codes

| Code | Meaning | Typical Scenario |
|------|---------|------------------|
| 200 | OK | Successful GET or POST update |
| 201 | Created | Successful POST create (returns new resource) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions or invalid nonce |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate slug or other constraint violation |
| 500 | Internal Server Error | Unexpected database or server error |

---

## CORS Headers

The plugin automatically handles CORS via WordPress REST API settings. By default:

```
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-WP-Nonce, Authorization
Access-Control-Allow-Credentials: true
```

**Note:** Adjust CORS policy if serving React app from different domain.

---

## Rate Limiting

No built-in rate limiting. Implement in your reverse proxy (nginx, Apache, Cloudflare) if needed.

**Recommended:**
- 100 requests per minute per IP for public endpoints
- 1000 requests per minute per user for authenticated endpoints

---

## Webhook Integration

After form submission, trigger custom webhook:

```php
add_action('form_builder_submission_created', function($id, $form_id, $data, $form) {
    wp_remote_post('https://your-webhook.example.com/forms', [
        'body' => json_encode([
            'submission_id' => $id,
            'form_id' => $form_id,
            'data' => $data,
            'timestamp' => current_time('c'),
        ]),
        'headers' => [
            'Content-Type' => 'application/json',
        ],
    ]);
}, 10, 4);
```

---

## Backward Compatibility

The API follows semantic versioning:
- Major version in URL (v1)
- Breaking changes will increment major version (v2, etc.)
- Current version: **v1**

**Currently stable endpoints:**
- All documented endpoints above

**Future considerations:**
- Bulk operations endpoint
- Export submissions endpoint
- Advanced filtering/search

---

## Testing API Endpoints

### Using cURL

```bash
# List forms
curl -H "X-WP-Nonce: $NONCE" \
     -H "Cookie: wordpress_session=$SESSION" \
     https://example.com/wp-json/form-builder/v1/forms

# Get form by slug
curl https://example.com/wp-json/form-builder/v1/forms/slug/contact-form

# Create form
curl -X POST \
     -H "Content-Type: application/json" \
     -H "X-WP-Nonce: $NONCE" \
     -H "Cookie: wordpress_session=$SESSION" \
     -d '{"title":"Test","slug":"test","schema":{...}}' \
     https://example.com/wp-json/form-builder/v1/forms

# Submit form
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"form_id":1,"data":{"name":"Test"}}' \
     https://example.com/wp-json/form-builder/v1/submissions
```

### Using Postman

1. Create new request
2. Set method: GET, POST, or DELETE
3. Set URL: `{{wordpress_url}}/wp-json/form-builder/v1{{endpoint}}`
4. For authenticated requests:
   - Add header: `X-WP-Nonce: {{nonce}}`
   - Add cookie: `wordpress_session={{session}}`
5. For POST requests with body:
   - Set Content-Type: application/json
   - Paste JSON body

### Using JavaScript/Fetch

```javascript
const apiBase = 'https://example.com/wp-json/form-builder/v1';

// Get form by slug (public)
const response = await fetch(`${apiBase}/forms/slug/contact-form`);
const form = await response.json();

// Create form (authenticated)
const createResponse = await fetch(`${apiBase}/forms`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': wpNonce,
  },
  credentials: 'include',
  body: JSON.stringify({
    title: 'New Form',
    slug: 'new-form',
    schema: { ... }
  })
});
```

---

## Support & Reporting Issues

For API-related issues:
1. Check error response messages
2. Verify authentication and permissions
3. Inspect WordPress error logs (`wp-content/debug.log`)
4. Check nonce validity
5. Validate request body structure
