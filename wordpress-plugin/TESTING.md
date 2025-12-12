# Testing Guide

Complete guide for testing the Form Builder WordPress plugin and its integration with the React app.

## Prerequisites

- WordPress 5.0+ installed and running
- Plugin activated
- React app running or built
- cURL or Postman for API testing

## API Testing

### Using cURL

#### Setup Variables

```bash
# Store commonly used values
export WORDPRESS_URL="http://localhost:8888"
export API_ENDPOINT="/wp-json/form-builder/v1"
export FORM_ID="1"
export FORM_SLUG="contact-us"

# Get nonce from authenticated session
export SESSION_COOKIE="your_wordpress_session_cookie"
export NONCE="your_wordpress_nonce"
```

#### Test 1: List All Forms (Requires Authentication)

```bash
curl -v -X GET \
  "${WORDPRESS_URL}${API_ENDPOINT}/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -H "Cookie: wordpress_session=${SESSION_COOKIE}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Contact Form",
      "slug": "contact-us",
      "schema": { ... }
    }
  ],
  "count": 1
}
```

#### Test 2: Get Form by Slug (Public)

```bash
curl -v -X GET \
  "${WORDPRESS_URL}${API_ENDPOINT}/forms/slug/${FORM_SLUG}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Contact Form",
    "slug": "contact-us",
    "schema": { ... }
  }
}
```

**Error Response (404 - form not found):**
```json
{
  "code": "not_found",
  "message": "Form not found",
  "data": {
    "status": 404
  }
}
```

#### Test 3: Create Form (Requires Authentication)

```bash
curl -v -X POST \
  "${WORDPRESS_URL}${API_ENDPOINT}/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -H "Cookie: wordpress_session=${SESSION_COOKIE}" \
  -d '{
    "title": "Test Form",
    "slug": "test-form",
    "schema": {
      "steps": [],
      "components": [
        {
          "id": "field-1",
          "type": "text",
          "props": {
            "label": "Name",
            "name": "name",
            "required": true,
            "placeholder": "Enter your name"
          },
          "order": 1
        }
      ]
    }
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Test Form",
    "slug": "test-form",
    "schema": { ... },
    "created_at": "2024-01-01 12:00:00",
    "updated_at": "2024-01-01 12:00:00"
  },
  "message": "Form created successfully"
}
```

#### Test 4: Update Form (Requires Authentication)

```bash
curl -v -X POST \
  "${WORDPRESS_URL}${API_ENDPOINT}/forms/${FORM_ID}" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -H "Cookie: wordpress_session=${SESSION_COOKIE}" \
  -d '{
    "title": "Updated Form Title",
    "schema": {
      "steps": [],
      "components": [
        {
          "id": "field-1",
          "type": "text",
          "props": {
            "label": "Name",
            "name": "name",
            "required": true
          },
          "order": 1
        },
        {
          "id": "field-2",
          "type": "email",
          "props": {
            "label": "Email",
            "name": "email",
            "required": true
          },
          "order": 2
        }
      ]
    }
  }'
```

**Expected Response (200):** Updated form object

#### Test 5: Submit Form (Public)

```bash
curl -v -X POST \
  "${WORDPRESS_URL}${API_ENDPOINT}/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 1,
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "This is a test submission"
    }
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "submission_id": 42,
  "message": "Submission received successfully"
}
```

#### Test 6: Get Form Submissions (Requires Admin)

```bash
curl -v -X GET \
  "${WORDPRESS_URL}${API_ENDPOINT}/forms/${FORM_ID}/submissions?limit=50&offset=0" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -H "Cookie: wordpress_session=${SESSION_COOKIE}"
```

**Expected Response (200):**
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
      "ip_address": "192.168.1.1",
      "user_agent": "curl/7.68.0",
      "user_id": null,
      "created_at": "2024-01-01 13:00:00"
    }
  ],
  "count": 1,
  "pagination": {
    "limit": 50,
    "offset": 0
  }
}
```

#### Test 7: Delete Form (Requires Authentication)

```bash
curl -v -X DELETE \
  "${WORDPRESS_URL}${API_ENDPOINT}/forms/${FORM_ID}" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -H "Cookie: wordpress_session=${SESSION_COOKIE}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Form deleted successfully"
}
```

## Postman Collection

Import this collection to test all endpoints in Postman:

```json
{
  "info": {
    "name": "Form Builder API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Forms",
      "item": [
        {
          "name": "List All Forms",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "X-WP-Nonce",
                "value": "{{nonce}}"
              }
            ],
            "url": {
              "raw": "{{wordpress_url}}/wp-json/form-builder/v1/forms",
              "protocol": "http",
              "host": ["localhost"],
              "port": "8888",
              "path": ["wp-json", "form-builder", "v1", "forms"]
            }
          }
        },
        {
          "name": "Get Form by Slug (Public)",
          "request": {
            "method": "GET",
            "url": {
              "raw": "{{wordpress_url}}/wp-json/form-builder/v1/forms/slug/contact-us",
              "path": ["wp-json", "form-builder", "v1", "forms", "slug", "contact-us"]
            }
          }
        },
        {
          "name": "Create Form",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "X-WP-Nonce",
                "value": "{{nonce}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"title\": \"New Form\", \"slug\": \"new-form\", \"schema\": {\"steps\": [], \"components\": []}}"
            },
            "url": {
              "raw": "{{wordpress_url}}/wp-json/form-builder/v1/forms",
              "path": ["wp-json", "form-builder", "v1", "forms"]
            }
          }
        }
      ]
    },
    {
      "name": "Submissions",
      "item": [
        {
          "name": "Submit Form (Public)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\"form_id\": 1, \"data\": {\"name\": \"Test\", \"email\": \"test@example.com\"}}"
            },
            "url": {
              "raw": "{{wordpress_url}}/wp-json/form-builder/v1/submissions",
              "path": ["wp-json", "form-builder", "v1", "submissions"]
            }
          }
        },
        {
          "name": "Get Submissions (Admin)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "X-WP-Nonce",
                "value": "{{nonce}}"
              }
            ],
            "url": {
              "raw": "{{wordpress_url}}/wp-json/form-builder/v1/forms/1/submissions?limit=50&offset=0",
              "path": ["wp-json", "form-builder", "v1", "forms", "1", "submissions"],
              "query": [
                {
                  "key": "limit",
                  "value": "50"
                },
                {
                  "key": "offset",
                  "value": "0"
                }
              ]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "wordpress_url",
      "value": "http://localhost:8888"
    },
    {
      "key": "nonce",
      "value": ""
    }
  ]
}
```

## React App Testing

### Manual Form Creation & Submission

1. **Open React app:** `http://localhost:5173`

2. **Navigate to Builder:** Click "Builder" tab

3. **Create form:**
   - Add "Text" field for name
   - Add "Email" field for email
   - Add "Textarea" field for message
   - Arrange in desired order

4. **Save form:**
   - Click "Save" button
   - Enter title: "Contact Form"
   - Enter slug: "contact-form"
   - Click "Save Form"

5. **Verify in database:**
   ```bash
   wp db query "SELECT id, title, slug FROM wp_form_builder_forms;"
   ```

6. **Test form retrieval:**
   ```bash
   curl http://localhost:8888/wp-json/form-builder/v1/forms/slug/contact-form
   ```

### Form Display on WordPress Page

1. **Create WordPress page:**
   ```bash
   wp post create --post_type=page --post_title="Contact" --post_content="[form-builder slug='contact-form']" --post_status=publish
   ```

2. **Visit page:** Go to the page URL in browser

3. **Verify form displays:** Should see form fields

4. **Test submission:** Fill out and submit form

5. **Check submission saved:**
   ```bash
   wp db query "SELECT id, data, created_at FROM wp_form_builder_submissions ORDER BY created_at DESC LIMIT 1;"
   ```

### Testing Different Field Types

```javascript
// Test schema with various field types
const testSchema = {
  "steps": [],
  "components": [
    {
      "id": "text-field",
      "type": "text",
      "props": { "label": "Text", "name": "text_field", "required": true },
      "order": 1
    },
    {
      "id": "email-field",
      "type": "email",
      "props": { "label": "Email", "name": "email_field", "required": true },
      "order": 2
    },
    {
      "id": "textarea-field",
      "type": "textarea",
      "props": { "label": "Textarea", "name": "textarea_field" },
      "order": 3
    },
    {
      "id": "select-field",
      "type": "select",
      "props": {
        "label": "Select",
        "name": "select_field",
        "options": [
          { "value": "opt1", "label": "Option 1" },
          { "value": "opt2", "label": "Option 2" }
        ]
      },
      "order": 4
    }
  ]
};
```

## Error Testing

### Test Missing Required Fields

```bash
# Missing title
curl -X POST \
  "http://localhost:8888/wp-json/form-builder/v1/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -d '{"slug": "test", "schema": {}}'

# Expected: 400 Bad Request
```

### Test Invalid Schema

```bash
# Schema is not an object
curl -X POST \
  "http://localhost:8888/wp-json/form-builder/v1/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -d '{"title": "Test", "slug": "test", "schema": "invalid"}'

# Expected: 400 Bad Request with "Schema must be a valid object"
```

### Test Missing Authentication

```bash
# No nonce header
curl -X GET \
  "http://localhost:8888/wp-json/form-builder/v1/forms"

# Expected: 403 Forbidden
```

### Test Duplicate Slug

```bash
# Create form with slug "duplicate"
curl -X POST \
  "http://localhost:8888/wp-json/form-builder/v1/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -d '{"title": "Form 1", "slug": "duplicate", "schema": {}}'

# Try to create another with same slug
curl -X POST \
  "http://localhost:8888/wp-json/form-builder/v1/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -d '{"title": "Form 2", "slug": "duplicate", "schema": {}}'

# Expected: 409 Conflict (or database error)
```

## Performance Testing

### Load Test: Submission Creation

```bash
#!/bin/bash

echo "Testing submission creation performance..."

for i in {1..100}; do
  curl -s -X POST \
    "http://localhost:8888/wp-json/form-builder/v1/submissions" \
    -H "Content-Type: application/json" \
    -d "{\"form_id\": 1, \"data\": {\"name\": \"Test ${i}\", \"email\": \"test${i}@example.com\"}}" > /dev/null
  
  if (( $i % 10 == 0 )); then
    echo "Created $i submissions..."
  fi
done

echo "100 submissions created. Checking database..."
wp db query "SELECT COUNT(*) FROM wp_form_builder_submissions;"
```

### Load Test: Form Retrieval

```bash
#!/bin/bash

echo "Testing form retrieval performance..."

time for i in {1..1000}; do
  curl -s "http://localhost:8888/wp-json/form-builder/v1/forms/slug/contact-form" > /dev/null
done

echo "1000 requests completed"
```

## Security Testing

### Test CORS Headers

```bash
# Test OPTIONS request
curl -v -X OPTIONS \
  "http://localhost:8888/wp-json/form-builder/v1/forms"

# Check for CORS headers in response
# Should see: Access-Control-Allow-Methods, Access-Control-Allow-Headers, etc.
```

### Test Nonce Validation

```bash
# Invalid nonce
curl -X POST \
  "http://localhost:8888/wp-json/form-builder/v1/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: invalid-nonce" \
  -d '{"title": "Test", "slug": "test", "schema": {}}'

# Expected: 403 Forbidden
```

### Test SQL Injection Prevention

```bash
# Try SQL injection in form title
curl -X POST \
  "http://localhost:8888/wp-json/form-builder/v1/forms" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: ${NONCE}" \
  -d '{
    "title": "Test\"; DROP TABLE wp_form_builder_forms; --",
    "slug": "test",
    "schema": {}
  }'

# Expected: Title sanitized, no SQL injection
# Verify table still exists:
wp db query "SELECT COUNT(*) FROM wp_form_builder_forms;"
```

## Automated Testing

### Using WP-CLI Test Suite

```bash
# Test plugin activation
wp plugin activate form-builder
wp plugin is-active form-builder
echo $?  # Should return 0

# Test database tables exist
wp db query "SHOW TABLES LIKE 'wp_form_builder_%';"

# Test REST endpoint availability
wp eval 'echo rest_get_url_details("/form-builder/v1");'
```

## Test Checklist

- [ ] Plugin activates without errors
- [ ] Database tables created
- [ ] REST endpoints are registered
- [ ] List forms (requires auth)
- [ ] Get form by slug (public)
- [ ] Create form (requires auth)
- [ ] Update form (requires auth)
- [ ] Delete form (requires auth)
- [ ] Submit form (public)
- [ ] Get submissions (requires admin)
- [ ] Email notifications sent
- [ ] Shortcode renders form
- [ ] Form displays on front-end
- [ ] Form submission works
- [ ] CORS headers present
- [ ] Nonce validation working
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Load test passes
- [ ] Error responses correct format

## Continuous Testing

### GitHub Actions (Example)

```yaml
name: Test Form Builder Plugin

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:5.7
        env:
          MYSQL_DATABASE: wordpress
          MYSQL_ROOT_PASSWORD: root
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup WordPress
        run: |
          wp core download --path=/tmp/wordpress
          wp config create --dbname=wordpress --dbuser=root --dbpass=root --dbhost=mysql
          wp db create
          wp core install --url=http://localhost --title=Test --admin_user=admin --admin_pass=admin --admin_email=admin@example.com
      
      - name: Activate Plugin
        run: wp plugin activate form-builder
      
      - name: Run Tests
        run: |
          # Test endpoints
          wp eval 'Form_Builder_Database::create_tables();'
          # Add more test commands here
```

## Debugging Tips

### Enable WordPress Debug Mode

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_DISPLAY', false);
define('WP_DEBUG_LOG', true);

// Log location: wp-content/debug.log
```

### View PHP Errors

```bash
tail -f wp-content/debug.log
```

### Debug REST API Routes

```bash
# List all registered routes
wp rest-api route list --format=table

# List only form-builder routes
wp rest-api route list --format=table | grep form-builder
```

### Debug Database Queries

```bash
# Enable query logging
wp db query "SET GLOBAL log_queries_not_using_indexes = 1;"

# View slow queries
wp db query "SELECT * FROM mysql.slow_log;"
```

For more detailed information, see [README.md](./README.md) and [API_CONTRACT.md](./API_CONTRACT.md).
