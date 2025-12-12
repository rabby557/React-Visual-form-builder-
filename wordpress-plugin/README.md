# Form Builder WordPress Plugin

A WordPress plugin that provides REST API endpoints for managing form schemas and collecting form submissions. This plugin seamlessly integrates with the React Form Builder application, enabling WordPress users to create, manage, and embed forms on their sites.

## Features

- **REST API Endpoints** for CRUD operations on form schemas
- **Form Submission Handling** with email notifications
- **Shortcode Support** for embedding forms on WordPress pages
- **Database Storage** of forms and submissions with JSON schema support
- **CORS-Friendly** endpoints for the React application
- **Soft Delete** for forms to maintain historical data
- **IP Tracking** and user agent logging for submissions
- **WordPress Hooks** for custom submission handling

## Installation

1. Copy the `form-builder` plugin directory to `/wp-content/plugins/`
2. Activate the plugin via WordPress admin dashboard (Plugins > Installed Plugins)
3. The plugin will automatically create required database tables on activation

**Alternatively, via command line:**

```bash
cp -r form-builder /path/to/wordpress/wp-content/plugins/
wp plugin activate form-builder
```

## Database Tables

The plugin creates two main tables:

### wp_form_builder_forms
Stores form schemas and metadata:
- `id` - Unique form identifier
- `title` - Form title
- `slug` - URL-friendly identifier
- `schema` - JSON form schema (components, steps, validation rules)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp (NULL if active)

### wp_form_builder_submissions
Stores form submissions:
- `id` - Unique submission identifier
- `form_id` - Reference to the form
- `data` - JSON submission data (field values)
- `ip_address` - Client IP address
- `user_agent` - Client user agent
- `user_id` - WordPress user ID (if logged in)
- `created_at` - Submission timestamp

## REST API Endpoints

Base URL: `/wp-json/form-builder/v1`

### Forms Management

#### List All Forms
```http
GET /forms
```

**Permission:** Requires authentication and valid nonce

**Response:**
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
        "components": [
          {
            "id": "field-1",
            "type": "text",
            "props": {
              "label": "Name",
              "name": "name",
              "required": true
            }
          }
        ]
      },
      "created_at": "2024-01-01 12:00:00",
      "updated_at": "2024-01-01 12:00:00"
    }
  ],
  "count": 1
}
```

#### Get Form by ID
```http
GET /forms/{id}
```

**Permission:** Requires authentication and valid nonce

**Response:** Single form object (same structure as above)

#### Get Form by Slug (Public)
```http
GET /forms/slug/{slug}
```

**Permission:** Public (no authentication required)

**Response:** Single form object

#### Create Form
```http
POST /forms
Content-Type: application/json

{
  "title": "Contact Form",
  "slug": "contact-form",
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
        }
      }
    ]
  }
}
```

**Permission:** Requires authentication and valid nonce

**Response:** Newly created form object with ID (HTTP 201)

#### Update Form
```http
POST /forms/{id}
Content-Type: application/json

{
  "title": "Updated Contact Form",
  "schema": {
    "steps": [],
    "components": [...]
  }
}
```

**Permission:** Requires authentication and valid nonce

**Response:** Updated form object (HTTP 200)

#### Delete Form
```http
DELETE /forms/{id}
```

**Permission:** Requires authentication and valid nonce

**Response:**
```json
{
  "success": true,
  "message": "Form deleted successfully"
}
```

### Submissions

#### Create Submission (Public)
```http
POST /submissions
Content-Type: application/json

{
  "form_id": 1,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }
}
```

**Permission:** Public (no authentication required)

**Response:**
```json
{
  "success": true,
  "submission_id": 42,
  "message": "Submission received successfully"
}
```

#### Get Form Submissions (Admin Only)
```http
GET /forms/{form_id}/submissions?limit=100&offset=0
```

**Permission:** Requires admin capability (manage_options)

**Response:**
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
      "user_agent": "Mozilla/5.0...",
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

## Shortcodes

### Embed Form by ID
```
[form-builder id="1"]
```

### Embed Form by Slug
```
[form-builder slug="contact-form"]
```

### With Custom CSS Class
```
[form-builder slug="contact-form" class="custom-form-class"]
```

## Configuration & Settings

### Environment Variables for React App

The React app needs to be configured with the following environment variables:

```env
# WordPress REST API base URL
VITE_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json

# Form Builder namespace
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1

# Enable email notifications (server-side setting)
FORM_BUILDER_ENABLE_EMAIL_NOTIFICATIONS=true
```

### WordPress Settings

Enable/disable email notifications for submissions:
```php
update_option('form_builder_enable_email_notifications', true);
```

## Hooks & Filters

### Actions

#### form_builder_submission_created
Triggered after a new submission is created:
```php
add_action('form_builder_submission_created', function($submission_id, $form_id, $data, $form) {
    // Handle submission (e.g., send custom email, webhook, etc.)
}, 10, 4);
```

Parameters:
- `$submission_id` - ID of the created submission
- `$form_id` - ID of the form
- `$data` - Array of submission data
- `$form` - Form object with schema

### Filters

#### form_builder_email_subject
Customize email subject for submission notifications:
```php
add_filter('form_builder_email_subject', function($subject, $form_id, $data, $form) {
    return "New submission for: " . $form->title;
}, 10, 4);
```

#### form_builder_email_body
Customize email body:
```php
add_filter('form_builder_email_body', function($body, $form_id, $data, $form) {
    return $body . "\n\nCustom footer text";
}, 10, 4);
```

#### form_builder_email_to
Customize recipient email address:
```php
add_filter('form_builder_email_to', function($to, $form_id, $data, $form) {
    return 'custom@example.com';
}, 10, 4);
```

## Security

### NONCE Security
- Admin endpoints (CRUD forms) require a valid WordPress nonce in the request
- Nonce is automatically provided by the React app via `wp_localize_script`

### Permissions
- Form CRUD operations require user authentication and admin capability
- Submission creation is public but validates form existence
- Submission viewing requires admin capability

### Data Sanitization
- All text inputs are sanitized using WordPress functions
- JSON data is validated before storage
- IP addresses are validated and sanitized

### CORS
The plugin leverages WordPress's built-in REST API CORS support. Ensure your React app's origin is properly configured in your WordPress setup.

## React Integration

### Setup in React App

1. **Configure API Base URL:**
   ```javascript
   // In your React app's API service
   const API_BASE = `${window.location.origin}/wp-json/form-builder/v1`;
   ```

2. **Fetch Form Schema:**
   ```javascript
   const response = await fetch(
     `${API_BASE}/forms/slug/contact-form`
   );
   const { data: form } = await response.json();
   ```

3. **Submit Form Data:**
   ```javascript
   const response = await fetch(
     `${API_BASE}/submissions`,
     {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         form_id: form.id,
         data: formValues,
       }),
     }
   );
   ```

4. **Create/Update Forms (Admin):**
   ```javascript
   const response = await fetch(
     `${API_BASE}/forms`,
     {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'X-WP-Nonce': window.formBuilderConfig.nonce,
       },
       credentials: 'include',
       body: JSON.stringify({
         title: 'My Form',
         slug: 'my-form',
         schema: formSchema,
       }),
     }
   );
   ```

## API Client Example

```javascript
class FormBuilderAPI {
  constructor(baseUrl, nonce) {
    this.baseUrl = baseUrl;
    this.nonce = nonce;
  }

  async listForms() {
    const res = await fetch(`${this.baseUrl}/forms`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return res.json();
  }

  async getForm(id) {
    const res = await fetch(`${this.baseUrl}/forms/${id}`, {
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return res.json();
  }

  async getFormBySlug(slug) {
    const res = await fetch(
      `${this.baseUrl}/forms/slug/${slug}`
    );
    return res.json();
  }

  async createForm(title, slug, schema) {
    const res = await fetch(`${this.baseUrl}/forms`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ title, slug, schema }),
    });
    return res.json();
  }

  async updateForm(id, title, schema) {
    const res = await fetch(`${this.baseUrl}/forms/${id}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ title, schema }),
    });
    return res.json();
  }

  async deleteForm(id) {
    const res = await fetch(`${this.baseUrl}/forms/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return res.json();
  }

  async submitForm(formId, data) {
    const res = await fetch(`${this.baseUrl}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ form_id: formId, data }),
    });
    return res.json();
  }

  async getSubmissions(formId, limit = 100, offset = 0) {
    const res = await fetch(
      `${this.baseUrl}/forms/${formId}/submissions?limit=${limit}&offset=${offset}`,
      {
        headers: this.getHeaders(),
        credentials: 'include',
      }
    );
    return res.json();
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-WP-Nonce': this.nonce,
    };
  }
}

// Usage
const api = new FormBuilderAPI(
  window.formBuilderConfig.apiBase,
  window.formBuilderConfig.nonce
);
```

## Troubleshooting

### Plugin activation fails
- Ensure WordPress version is 5.0 or higher
- Check PHP error logs for detailed messages
- Verify database user has CREATE TABLE permissions

### REST endpoints return 403 Forbidden
- Ensure WordPress REST API is enabled (should be by default)
- For admin endpoints, verify user is logged in and has appropriate capabilities
- Check that nonce is being sent in request headers

### Forms not displaying on pages
- Verify shortcode syntax is correct: `[form-builder id="1"]` or `[form-builder slug="my-form"]`
- Check that form exists and is not soft-deleted
- Ensure React app assets are properly built and located in `assets/dist/`

### Email notifications not sending
- Verify `form_builder_enable_email_notifications` option is set to `true`
- Check WordPress email configuration (WP Mail plugin or server mail setup)
- Review email filters - custom filters might be overriding recipient or content

## Development

### Plugin Structure
```
form-builder/
├── form-builder.php           # Main plugin file
├── includes/
│   ├── class-database.php     # Database operations
│   ├── class-rest-forms.php   # Form REST endpoints
│   ├── class-rest-submissions.php # Submission endpoints
│   └── class-shortcodes.php   # Shortcode registration
├── assets/
│   └── dist/
│       ├── form-builder.js    # React app bundle
│       └── style.css          # Form styles
└── README.md                  # This file
```

### Adding Custom Hooks

To add custom handling for submissions, add code to your theme's `functions.php`:

```php
add_action('form_builder_submission_created', function($submission_id, $form_id, $data, $form) {
    // Send to external service
    wp_remote_post('https://api.example.com/webhook', [
        'body' => wp_json_encode($data),
    ]);
}, 10, 4);
```

## Support & Documentation

For more information on integrating the React Form Builder with this plugin, see:
- [INTEGRATION.md](./INTEGRATION.md) - Detailed integration guide
- [API_CONTRACT.md](./API_CONTRACT.md) - Complete API specification

## License

GPL v2 or later

## Author

Builder Team
