# Quick Start Guide

Get the Form Builder WordPress plugin up and running in minutes.

## 5-Minute Setup

### 1. Install WordPress Locally (if needed)

```bash
# Using Docker (easiest)
docker run -d \
  --name wordpress \
  -p 8888:80 \
  -e WORDPRESS_DB_HOST=db \
  -e WORDPRESS_DB_NAME=wordpress \
  -e WORDPRESS_DB_USER=wordpress \
  -e WORDPRESS_DB_PASSWORD=wordpress \
  --network wordpress_net \
  wordpress:latest
```

### 2. Copy Plugin

```bash
cp -r form-builder /path/to/wordpress/wp-content/plugins/
```

### 3. Activate Plugin

Via admin dashboard:
- Go to Plugins > Installed Plugins
- Find "Form Builder"
- Click "Activate"

Or via WP-CLI:
```bash
wp plugin activate form-builder
```

### 4. Test REST API

```bash
# Get public form by slug (no auth needed)
curl http://localhost:8888/wp-json/form-builder/v1/forms/slug/contact-form

# Should return 404 until you create a form
```

### 5. Setup React App

```bash
# In React app directory
cp wordpress-plugin/.env.example .env.local

# Edit .env.local
VITE_WORDPRESS_API_URL=http://localhost:8888
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the form builder!

## Create Your First Form

### Via React Builder UI

1. Open the React app at `http://localhost:5173`
2. Click "Builder" tab
3. Add fields by dragging from the component panel
4. Configure field properties
5. Click "Save" and enter form details:
   - Title: "Contact Us"
   - Slug: "contact-us"
   - Click "Save Form"

### Via API (for testing)

```bash
curl -X POST http://localhost:8888/wp-json/form-builder/v1/forms \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: YOUR_NONCE" \
  -H "Cookie: wordpress_session=YOUR_SESSION" \
  -d '{
    "title": "Contact Us",
    "slug": "contact-us",
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

## Embed Form on Page

### Using Shortcode

1. Create a new WordPress page
2. Add shortcode: `[form-builder slug="contact-us"]`
3. Publish page
4. Form will appear on the front-end!

### Verify It Works

1. Visit the page with the form
2. Fill out and submit the form
3. Check WordPress admin > Form Submissions

## Common Commands

### List All Forms

```bash
# Via API
curl -H "X-WP-Nonce: $NONCE" \
     -H "Cookie: wordpress_session=$SESSION" \
     http://localhost:8888/wp-json/form-builder/v1/forms

# Via WP-CLI
wp eval 'print_r(Form_Builder_Database::get_all_forms());'
```

### Get Form Submissions

```bash
# Via API (admin only)
curl -H "X-WP-Nonce: $NONCE" \
     -H "Cookie: wordpress_session=$SESSION" \
     http://localhost:8888/wp-json/form-builder/v1/forms/1/submissions

# Via WP-CLI
wp eval 'print_r(Form_Builder_Database::get_form_submissions(1));'
```

### Submit Form (from React app)

```javascript
// In React form submission handler
const response = await fetch(
  '/wp-json/form-builder/v1/submissions',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      form_id: 1,
      data: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    })
  }
);

const result = await response.json();
console.log('Submission ID:', result.submission_id);
```

### Delete Form

```bash
curl -X DELETE \
  -H "X-WP-Nonce: $NONCE" \
  -H "Cookie: wordpress_session=$SESSION" \
  http://localhost:8888/wp-json/form-builder/v1/forms/1
```

## Development Workflow

### Local Development

```bash
# Terminal 1: Start WordPress (if using Docker)
docker-compose up

# Terminal 2: Start React dev server
cd form-builder-react-app
npm run dev

# Terminal 3: Watch plugin changes
cd wordpress-plugin
# Make changes to PHP files
# They're automatically loaded by WordPress
```

### Making Changes

**To React app:**
- Changes auto-reload in browser
- Save and refresh to see updates

**To WordPress plugin:**
- Changes take effect on next page load
- Deactivate/reactivate if needed: `wp plugin toggle form-builder`

### Testing Changes

```bash
# Test API endpoints
curl http://localhost:8888/wp-json/form-builder/v1/forms/slug/contact-us

# Check WordPress logs
tail -f wp-content/debug.log

# Run plugin checks
wp plugin status form-builder
```

## Environment Variables

### For React App (.env.local)

```env
# WordPress API URL
VITE_WORDPRESS_API_URL=http://localhost:8888

# API namespace
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1

# Debug mode
VITE_DEBUG=true
```

### For WordPress (wp-cli or functions.php)

```bash
# Enable email notifications
wp option update form_builder_enable_email_notifications 1

# Set admin email
wp option update form_builder_admin_email admin@example.com
```

## Troubleshooting

### "Form not found" when loading by slug

**Solution:**
```bash
# Verify form exists in database
wp db query "SELECT id, title, slug FROM wp_form_builder_forms WHERE slug='contact-us';"

# Verify slug spelling in shortcode
# [form-builder slug="contact-us"]  ← Must match database exactly
```

### REST API returning 403 Forbidden

**Solution:**
1. Check if user is logged in (for admin endpoints)
2. Verify nonce is valid
3. Check user has manage_options capability

```bash
# Test nonce
wp eval 'echo wp_create_nonce("wp_rest");'

# Check user capability
wp user list --format=table
wp user get 1  # Check admin user
```

### Form not submitting

**Solution:**
1. Check browser console for JavaScript errors
2. Verify form schema is valid JSON
3. Check WordPress debug log

```bash
# Enable debug mode temporarily
wp config set WP_DEBUG true --raw
wp config set WP_DEBUG_LOG true --raw

# Watch logs
tail -f wp-content/debug.log
```

### Email notifications not sending

**Solution:**
```bash
# Verify setting is enabled
wp option get form_builder_enable_email_notifications

# Enable if disabled
wp option update form_builder_enable_email_notifications 1

# Check admin email
wp option get admin_email
```

## Next Steps

1. **Read documentation:**
   - [README.md](./README.md) - Full plugin guide
   - [INTEGRATION.md](./INTEGRATION.md) - React integration details
   - [API_CONTRACT.md](./API_CONTRACT.md) - Complete API reference

2. **Customize plugin:**
   - Add custom hooks in theme's functions.php
   - Customize email templates
   - Add custom validation rules

3. **Deploy:**
   - Copy plugin to production WordPress
   - Build React app for production
   - Configure environment variables
   - Test all endpoints

## Example: Send Email on Form Submission

Add to your WordPress theme's `functions.php`:

```php
add_action('form_builder_submission_created', function($id, $form_id, $data, $form) {
    $to = $data['email'] ?? get_option('admin_email');
    $subject = 'Form Submission: ' . $form->title;
    $body = "New submission received:\n\n";
    
    foreach ($data as $key => $value) {
        $body .= ucfirst($key) . ": $value\n";
    }
    
    wp_mail($to, $subject, $body);
}, 10, 4);
```

## Example: Webhook Integration

Send submissions to external service:

```php
add_action('form_builder_submission_created', function($id, $form_id, $data, $form) {
    wp_remote_post('https://api.example.com/webhook', [
        'body' => json_encode([
            'form' => $form->title,
            'data' => $data,
            'timestamp' => current_time('c'),
        ]),
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer YOUR_API_KEY',
        ],
    ]);
}, 10, 4);
```

## Support

- Check [INTEGRATION.md](./INTEGRATION.md) for integration questions
- See [API_CONTRACT.md](./API_CONTRACT.md) for API details
- Review [README.md](./README.md) for complete documentation
- Check WordPress debug log: `wp-content/debug.log`

Happy form building! 🎉
