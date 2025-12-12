# React Form Builder & WordPress Integration Guide

This guide explains how the React Form Builder application integrates with the WordPress plugin to create, manage, and embed forms on WordPress sites.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  React Form Builder                      │
│                   (VITE Frontend App)                    │
│  - Form Designer (Builder View)                          │
│  - Form Preview (Preview View)                           │
│  - Form Submission Handler                              │
└──────────────┬──────────────────────────────────────────┘
               │
               │ REST API Calls
               │ (fetch/axios)
               │
┌──────────────▼──────────────────────────────────────────┐
│        WordPress REST API (/wp-json/form-builder/v1)    │
│                                                          │
│  Forms Endpoint:      /forms                            │
│  Submissions Endpoint: /submissions                      │
│  By Slug Endpoint:    /forms/slug/{slug} (public)       │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│            WordPress Plugin (PHP Classes)                │
│                                                          │
│  - Form_Builder_REST_Forms                              │
│  - Form_Builder_REST_Submissions                         │
│  - Form_Builder_Database                                │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────┐
│              MySQL Database                              │
│                                                          │
│  - wp_form_builder_forms                                │
│  - wp_form_builder_submissions                          │
└──────────────────────────────────────────────────────────┘
```

## Form Schema Format

The form schema used throughout the system is defined in the React app's types:

```typescript
// From src/types/index.ts
interface FormSchema {
  steps: FormStep[];
  components: Component[];
}

interface Component {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: string[];
  order: number;
  stepId?: string;
}

interface FormStep {
  id: string;
  title: string;
  order: number;
}
```

### Example Form Schema (JSON)

```json
{
  "steps": [
    {
      "id": "step-1",
      "title": "Contact Information",
      "order": 1
    }
  ],
  "components": [
    {
      "id": "field-1",
      "type": "text",
      "props": {
        "label": "Full Name",
        "name": "full_name",
        "required": true,
        "placeholder": "Enter your full name"
      },
      "order": 1,
      "stepId": "step-1"
    },
    {
      "id": "field-2",
      "type": "email",
      "props": {
        "label": "Email Address",
        "name": "email",
        "required": true,
        "placeholder": "your@email.com"
      },
      "order": 2,
      "stepId": "step-1"
    },
    {
      "id": "field-3",
      "type": "textarea",
      "props": {
        "label": "Message",
        "name": "message",
        "required": false,
        "placeholder": "Your message here..."
      },
      "order": 3,
      "stepId": "step-1"
    }
  ]
}
```

## Field Types Supported

The React app supports the following field types:

| Type | Props | Description |
|------|-------|-------------|
| `text` | label, name, required, placeholder, minLength, maxLength | Single-line text input |
| `email` | label, name, required, placeholder | Email input field |
| `password` | label, name, required, placeholder | Password input field |
| `textarea` | label, name, required, placeholder, minLength, maxLength | Multi-line text input |
| `select` | label, name, required, options[] | Dropdown selection |
| `checkbox` | label, name, checked | Single checkbox |
| `radio` | label, name, options[], value | Radio button group |
| `file_upload` | label, name, required, accept, multiple | File upload input |
| `date` | label, name, required, min, max | Date picker |
| `time` | label, name, required | Time picker |
| `slider` | label, name, min, max, step, value | Range slider |
| `rich_text` | label, name, required | Rich text editor |

## Workflow: Creating and Embedding Forms

### Step 1: Designer Creates Form in React Builder

```
User opens React app → /builder
  ↓
Designer adds fields and configures them
  ↓
Designer saves form
  ↓
React app calls: POST /wp-json/form-builder/v1/forms
  {
    "title": "Contact Us",
    "slug": "contact-us",
    "schema": { ... }
  }
  ↓
WordPress returns: { id: 1, title: "Contact Us", ... }
```

**Required headers for form creation:**
```javascript
{
  'Content-Type': 'application/json',
  'X-WP-Nonce': wpNonce,  // From wp_localize_script
  'Cookie': document.cookie  // For authentication
}
```

### Step 2: WordPress Admin Embeds Form on Page

WordPress admin adds shortcode to page content:
```
[form-builder slug="contact-us"]
```

Or in PHP:
```php
echo do_shortcode('[form-builder slug="contact-us"]');
```

### Step 3: Form Renders on Front-End

```
Page loads
  ↓
Shortcode processor detects [form-builder]
  ↓
WordPress enqueues React app bundle
  ↓
React app loads form schema from:
  GET /wp-json/form-builder/v1/forms/slug/contact-us
  (This endpoint is PUBLIC - no authentication needed)
  ↓
React renders form in the container
```

### Step 4: User Submits Form

```
User fills out form and clicks Submit
  ↓
React app collects form values
  ↓
React calls: POST /wp-json/form-builder/v1/submissions
  {
    "form_id": 1,
    "data": {
      "full_name": "John Doe",
      "email": "john@example.com",
      "message": "Hello!"
    }
  }
  ↓
WordPress stores submission in database
  ↓
WordPress triggers: do_action('form_builder_submission_created', ...)
  ↓
Email notification sent to admin (if enabled)
  ↓
React shows success message
```

## Environment Variables Setup

### For React App (Frontend)

Create `.env.local` in the React app root:

```env
# API Configuration
VITE_WORDPRESS_API_URL=http://localhost:8888
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1

# Optional: Enable debug logging
VITE_DEBUG=false
```

### Usage in React Code

```javascript
const apiUrl = `${import.meta.env.VITE_WORDPRESS_API_URL}/wp-json/${import.meta.env.VITE_FORM_BUILDER_NAMESPACE}`;

// Usage
async function getForm(slug) {
  const response = await fetch(`${apiUrl}/forms/slug/${slug}`);
  return response.json();
}
```

## WordPress Configuration

### Database Configuration

The plugin uses standard WordPress database functions. Ensure your WordPress database is properly configured with adequate storage for:

- Form schemas (stored as JSON, up to 16MB per form)
- Submissions (unlimited, with cleanup policies)

### PHP Configuration

Recommended settings in `php.ini` or WordPress config:

```php
// In wp-config.php for large form schemas
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// For file uploads in forms
@ini_set('upload_max_filesize', '20M');
@ini_set('post_max_size', '20M');
```

## Submission Data Flow

### How Submission Data is Stored

Each form submission is stored with the following information:

```php
{
  "id": 42,                          // Submission ID
  "form_id": 1,                      // Reference to form
  "data": {                          // Actual form data
    "field_1": "value",
    "field_2": "value",
    "field_3": "value"
  },
  "ip_address": "192.168.1.100",     // Client IP
  "user_agent": "Mozilla/5.0...",    // Browser info
  "user_id": null,                   // WP user ID (if logged in)
  "created_at": "2024-01-01 12:00:00"
}
```

### Accessing Submissions Programmatically

From the admin side via REST API:

```javascript
// Get submissions for a form (admin only)
const response = await fetch(
  'http://wordpress.local/wp-json/form-builder/v1/forms/1/submissions?limit=50&offset=0',
  {
    headers: {
      'X-WP-Nonce': adminNonce,
      'Cookie': document.cookie
    }
  }
);
const { data: submissions } = await response.json();
```

From WordPress PHP code:

```php
// Using the database class
$submissions = Form_Builder_Database::get_form_submissions($form_id, $limit = 100, $offset = 0);

foreach ($submissions as $submission) {
  echo $submission->data['email']; // Access form field values
}
```

## Authentication & Security

### Nonce-Based Protection

For admin operations (creating/updating/deleting forms):

1. WordPress provides nonce via `wp_localize_script()`
2. React app sends nonce in `X-WP-Nonce` header
3. WordPress REST API verifies nonce before allowing operation

### User Roles & Capabilities

- **Form CRUD Operations**: Requires `manage_options` capability (admin users)
- **Submit Forms**: Public (no authentication required)
- **View Submissions**: Requires `manage_options` capability (admin users)

### Session Management

```javascript
// React app handles authentication via WordPress sessions
// No OAuth or token-based auth needed - WordPress cookies handle it

// Include credentials in all admin requests
fetch(apiUrl, {
  credentials: 'include',  // Important! Sends WordPress session cookie
  headers: {
    'X-WP-Nonce': wpNonce
  }
});
```

## Local Development Setup

### Prerequisites

- WordPress 5.0+ installation (local or remote)
- Node.js 18+ (for React app development)
- PHP 7.4+ (for WordPress)

### Step-by-Step Setup

1. **Activate Plugin:**
   ```bash
   # Copy plugin to WordPress
   cp -r wordpress-plugin/form-builder /path/to/wordpress/wp-content/plugins/
   
   # Activate via WP-CLI
   wp plugin activate form-builder
   ```

2. **Configure React App:**
   ```bash
   # In React app directory
   cp .env.example .env.local
   
   # Edit .env.local with your WordPress URL
   VITE_WORDPRESS_API_URL=http://localhost:8888
   VITE_FORM_BUILDER_NAMESPACE=form-builder/v1
   ```

3. **Build React App:**
   ```bash
   npm install
   npm run build
   ```

4. **Test API Endpoints:**
   ```bash
   # List forms
   curl -H "X-WP-Nonce: YOUR_NONCE" \
        http://localhost:8888/wp-json/form-builder/v1/forms
   
   # Get public form
   curl http://localhost:8888/wp-json/form-builder/v1/forms/slug/contact-us
   
   # Submit form
   curl -X POST \
        -H "Content-Type: application/json" \
        -d '{"form_id": 1, "data": {"name": "Test"}}' \
        http://localhost:8888/wp-json/form-builder/v1/submissions
   ```

## Common Integration Patterns

### Pattern 1: Single Page App in WordPress

```javascript
// Mount React app in a specific page
const container = document.getElementById('form-builder-app');
if (container) {
  ReactDOM.createRoot(container).render(<FormBuilder />);
}
```

### Pattern 2: Multi-Form Dashboard

```javascript
// Display all forms in an admin dashboard
async function loadForms() {
  const response = await fetch(
    '/wp-json/form-builder/v1/forms',
    {
      headers: { 'X-WP-Nonce': wpNonce },
      credentials: 'include'
    }
  );
  const { data: forms } = await response.json();
  return forms;
}
```

### Pattern 3: Conditional Form Display

```
[form-builder slug="contact-form" class="hidden-on-mobile"]
```

Then use CSS media queries:
```css
.hidden-on-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hidden-on-mobile {
    display: block;
  }
}
```

### Pattern 4: Custom Submission Handler

In WordPress theme's `functions.php`:

```php
add_action('form_builder_submission_created', function($id, $form_id, $data, $form) {
    // Send to CRM
    wp_remote_post('https://api.crm.example.com/contacts', [
        'body' => json_encode([
            'email' => $data['email'],
            'name' => $data['name'],
            'form_title' => $form->title,
        ]),
    ]);
}, 10, 4);
```

## Troubleshooting Integration Issues

### Issue: Forms not saving
**Solution:**
1. Check browser console for API errors
2. Verify nonce is being sent: Look in Network tab for `X-WP-Nonce` header
3. Ensure user is logged in with admin capability
4. Check WordPress REST API is not blocked by security plugins

### Issue: Shortcode not rendering form
**Solution:**
1. Verify form exists: `wp db query "SELECT * FROM wp_form_builder_forms WHERE slug='contact-us'"`
2. Check form ID/slug in shortcode matches database
3. Ensure React app bundle is built and in `assets/dist/`
4. Check browser console for JavaScript errors

### Issue: Submissions not appearing
**Solution:**
1. Verify form_id in submission request matches actual form ID
2. Check `wp_form_builder_submissions` table has entries
3. Ensure user is admin when viewing submissions endpoint
4. Check permission callback: User must have `manage_options`

### Issue: Email notifications not sending
**Solution:**
1. Verify `form_builder_enable_email_notifications` is `true`:
   ```php
   echo get_option('form_builder_enable_email_notifications');
   ```
2. Test WordPress mail function: `wp_mail('test@example.com', 'Test', 'Body');`
3. Check email filter isn't being overridden
4. Review WordPress error logs for mail errors

## Performance Considerations

### Submission Storage
- Clean up old submissions periodically for large-volume forms
- Add indexes on frequently queried columns (`form_id`, `created_at`)
- Consider archiving submissions older than 1 year

### Form Schema Size
- Keep form schemas reasonable (< 1MB)
- Limit number of components per form (< 500)
- Validate schema structure client-side before saving

### API Response Times
- Pagination recommended for submission retrieval
- Use `limit` and `offset` parameters
- Consider caching form schema responses

## Next Steps

1. **Deploy React app** to production build
2. **Copy plugin files** to WordPress plugin directory
3. **Activate plugin** in WordPress admin
4. **Test API endpoints** with curl or Postman
5. **Create sample forms** and embed via shortcode
6. **Monitor submissions** in WordPress admin

For more details, see [API_CONTRACT.md](./API_CONTRACT.md)
