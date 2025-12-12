# WordPress Form Builder Plugin Integration

This project now includes a complete WordPress plugin that provides REST API endpoints for managing form schemas and handling submissions. The plugin seamlessly integrates with the React Form Builder application.

## Plugin Location

The WordPress plugin is located in the `wordpress-plugin/` directory at the root of this project.

## Quick Start

### 1. Install the Plugin

```bash
# Copy plugin to your WordPress installation
cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/form-builder

# Activate via WordPress admin or WP-CLI
wp plugin activate form-builder
```

### 2. Configure React App

```bash
# Copy environment template
cp wordpress-plugin/.env.example .env.local

# Edit .env.local with your WordPress URL
VITE_WORDPRESS_API_URL=http://localhost:8888
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1
```

### 3. Build and Deploy

```bash
# Build the React app
npm run build

# Copy assets to plugin (for embedding forms on pages)
cp -r dist/* wordpress-plugin/assets/dist/
```

### 4. Test

```bash
# Verify plugin is active
wp plugin is-active form-builder

# Test REST endpoints
curl http://localhost:8888/wp-json/form-builder/v1/forms/slug/test
```

## What's Included

### Core Features

✅ **Form Management**
- REST API for CRUD operations on form schemas
- Database tables for forms and submissions
- Soft delete for data retention
- JSON schema storage

✅ **Submissions**
- Public submission endpoint
- Email notifications (configurable)
- IP and user agent tracking
- Admin submission retrieval

✅ **WordPress Integration**
- Shortcodes for embedding forms: `[form-builder slug="contact-form"]`
- WordPress hooks for extensibility
- CORS support for frontend apps
- Nonce-based security

✅ **API Endpoints**
```
GET    /wp-json/form-builder/v1/forms                    # List forms (admin)
GET    /wp-json/form-builder/v1/forms/{id}               # Get form (admin)
GET    /wp-json/form-builder/v1/forms/slug/{slug}        # Get form (public)
POST   /wp-json/form-builder/v1/forms                    # Create form (admin)
POST   /wp-json/form-builder/v1/forms/{id}               # Update form (admin)
DELETE /wp-json/form-builder/v1/forms/{id}               # Delete form (admin)
POST   /wp-json/form-builder/v1/submissions              # Submit form (public)
GET    /wp-json/form-builder/v1/forms/{id}/submissions   # Get submissions (admin)
```

## Documentation

Complete documentation is available in the `wordpress-plugin/` directory:

| Document | Purpose |
|----------|---------|
| [README.md](./wordpress-plugin/README.md) | Plugin overview and features |
| [QUICKSTART.md](./wordpress-plugin/QUICKSTART.md) | 5-minute setup guide |
| [INSTALLATION.md](./wordpress-plugin/INSTALLATION.md) | Detailed installation |
| [INTEGRATION.md](./wordpress-plugin/INTEGRATION.md) | React app integration |
| [API_CONTRACT.md](./wordpress-plugin/API_CONTRACT.md) | API specification |
| [TESTING.md](./wordpress-plugin/TESTING.md) | Testing procedures |
| [DEPLOYMENT.md](./wordpress-plugin/DEPLOYMENT.md) | Production deployment |
| [INDEX.md](./wordpress-plugin/INDEX.md) | Documentation index |

## Architecture

```
┌─────────────────────────────┐
│  React Form Builder App     │
│  (Vite + React + Redux)     │
└──────────────┬──────────────┘
               │
        REST API Calls
               │
┌──────────────▼──────────────┐
│  WordPress REST API         │
│  (/wp-json/form-builder/v1) │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  Plugin PHP Classes         │
│  - Forms Manager            │
│  - Submissions Handler      │
│  - Shortcode Renderer       │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│  WordPress Database         │
│  - wp_form_builder_forms    │
│  - wp_form_builder_submissions
└─────────────────────────────┘
```

## Form Schema Format

Forms are stored as JSON with the following structure:

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
        "placeholder": "Enter your name"
      },
      "order": 1,
      "stepId": "step-1"
    }
  ]
}
```

## Workflow Example

### 1. Designer Creates Form

Designer opens React app and creates a form using the builder UI.

### 2. Form is Saved to WordPress

```javascript
// React app calls REST API
fetch('/wp-json/form-builder/v1/forms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WP-Nonce': wpNonce
  },
  body: JSON.stringify({
    title: 'Contact Us',
    slug: 'contact-us',
    schema: {...}
  })
});
```

### 3. Admin Embeds Form on Page

```
WordPress admin adds: [form-builder slug="contact-us"]
```

### 4. Form Displays on Front-End

React app loads form from public endpoint and renders it.

### 5. User Submits Form

```javascript
// React app submits form data
fetch('/wp-json/form-builder/v1/submissions', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    form_id: 1,
    data: {...}
  })
});
```

### 6. Admin Reviews Submission

Admin views submissions in WordPress or via admin API.

## Configuration

### Environment Variables

```env
# In .env.local (React app)
VITE_WORDPRESS_API_URL=http://localhost:8888
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1
VITE_DEBUG=false
```

### WordPress Options

```bash
# Enable/disable email notifications
wp option update form_builder_enable_email_notifications 1

# Set admin email for submissions
wp option update form_builder_admin_email admin@example.com
```

## Development Workflow

```bash
# Terminal 1: Start WordPress (if using Docker)
docker-compose up

# Terminal 2: Start React dev server
npm run dev
# Opens on http://localhost:5173

# Terminal 3: Watch for plugin changes
cd wordpress-plugin
# Make PHP changes, they reload automatically
```

## Testing API

### Create a Test Form

```bash
curl -X POST http://localhost:8888/wp-json/form-builder/v1/forms \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: YOUR_NONCE" \
  -H "Cookie: wordpress_session=YOUR_SESSION" \
  -d '{
    "title": "Test Form",
    "slug": "test-form",
    "schema": {
      "steps": [],
      "components": [{
        "id": "field-1",
        "type": "text",
        "props": {"label": "Name", "name": "name"},
        "order": 1
      }]
    }
  }'
```

### Get Form (Public)

```bash
curl http://localhost:8888/wp-json/form-builder/v1/forms/slug/test-form
```

### Submit Form

```bash
curl -X POST http://localhost:8888/wp-json/form-builder/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 1,
    "data": {"name": "John Doe"}
  }'
```

## Security Features

- **NONCE Protection**: WordPress nonces for CSRF protection
- **Role-Based Access**: Admin operations require `manage_options` capability
- **Input Validation**: All inputs sanitized and validated
- **SQL Injection Prevention**: Prepared statements for all queries
- **XSS Prevention**: WordPress escaping functions used throughout
- **Rate Limiting**: Can be configured at web server level

## Performance

- Optimized database queries with proper indexes
- JSON schema storage for flexibility
- Pagination support for submissions
- Caching recommendations in deployment guide
- Soft deletes to preserve historical data

## Extension Points

### Custom Hooks

Handle submissions differently:

```php
// In WordPress theme's functions.php
add_action('form_builder_submission_created', function($id, $form_id, $data, $form) {
    // Send to external service, trigger custom email, etc.
}, 10, 4);
```

### Custom Filters

Customize email notifications:

```php
add_filter('form_builder_email_subject', function($subject, $form_id, $data, $form) {
    return "New submission: " . $form->title;
}, 10, 4);
```

## Troubleshooting

### Plugin won't activate
- Check PHP version ≥ 7.4
- Check WordPress version ≥ 5.0
- Ensure database user has CREATE TABLE permissions
- See [INSTALLATION.md](./wordpress-plugin/INSTALLATION.md)

### REST endpoints return 404
- Run `wp rewrite flush`
- Check mod_rewrite is enabled (Apache)
- Verify nginx config (nginx)
- See [INSTALLATION.md](./wordpress-plugin/INSTALLATION.md)

### Forms not displaying
- Verify shortcode syntax: `[form-builder slug="contact-form"]`
- Check form exists: `wp db query "SELECT * FROM wp_form_builder_forms;"`
- Ensure React app is built

### Email not sending
- Verify setting: `wp option get form_builder_enable_email_notifications`
- Test: `wp eval 'wp_mail("test@example.com", "Test", "Body");'`
- See [TESTING.md](./wordpress-plugin/TESTING.md)

## File Structure

```
wordpress-plugin/
├── form-builder.php              # Main plugin file
├── includes/
│   ├── class-database.php        # Database operations
│   ├── class-rest-forms.php      # Form endpoints
│   ├── class-rest-submissions.php # Submission endpoints
│   └── class-shortcodes.php      # Shortcode support
├── assets/
│   └── dist/
│       ├── form-builder.js       # React app bundle
│       └── style.css             # Styles
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── README.md                     # Main documentation
├── QUICKSTART.md                 # Quick setup
├── INSTALLATION.md               # Installation guide
├── INTEGRATION.md                # React integration
├── API_CONTRACT.md               # API specification
├── TESTING.md                    # Testing guide
├── DEPLOYMENT.md                 # Production deployment
└── INDEX.md                      # Documentation index
```

## Next Steps

1. **Read [QUICKSTART.md](./wordpress-plugin/QUICKSTART.md)** - Get up and running in 5 minutes
2. **Follow [INSTALLATION.md](./wordpress-plugin/INSTALLATION.md)** - Detailed setup instructions
3. **Review [API_CONTRACT.md](./wordpress-plugin/API_CONTRACT.md)** - Understand the API
4. **Test with [TESTING.md](./wordpress-plugin/TESTING.md)** - Verify everything works
5. **Deploy with [DEPLOYMENT.md](./wordpress-plugin/DEPLOYMENT.md)** - Go to production

## Support

Comprehensive documentation is available in the `wordpress-plugin/` directory. See [INDEX.md](./wordpress-plugin/INDEX.md) for a complete documentation index.

## Version

- **Plugin Version**: 1.0.0
- **Requires WordPress**: 5.0+
- **Requires PHP**: 7.4+

## License

GPL v2 or later

---

**Start here:** [wordpress-plugin/QUICKSTART.md](./wordpress-plugin/QUICKSTART.md)
