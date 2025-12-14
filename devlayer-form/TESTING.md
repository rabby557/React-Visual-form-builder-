# DevLayer Form Plugin - Testing Guide

## Activation Testing

### Manual Activation

1. Log in to WordPress admin panel
2. Navigate to Plugins
3. Find "DevLayer Form" in the plugin list
4. Click "Activate"
5. You should see no errors and the plugin should be listed as active

### Expected Behavior on Activation

- Two new database tables created:
  - `wp_devlayer_forms` - Stores form definitions
  - `wp_devlayer_submissions` - Stores form submissions
- Option `devlayer_form_db_version` set to `1`
- No warnings or fatal errors in error logs

## Database Verification

### Verify Tables Created

```sql
-- Check if forms table exists
DESCRIBE wp_devlayer_forms;

-- Check if submissions table exists
DESCRIBE wp_devlayer_submissions;

-- Check foreign key relationship
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, 
       REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'wordpress' 
AND TABLE_NAME = 'wp_devlayer_submissions';
```

## PHP Syntax Verification

Run PHP syntax check on all plugin files:

```bash
php -l devlayer-form/devlayer-form.php
php -l devlayer-form/includes/class-*.php
```

## PHPCS Code Standards

Check WordPress coding standards:

```bash
phpcs devlayer-form --standard=WordPress
```

## API Testing

### Test REST Endpoints

Once REST class is implemented, test:

```bash
# Get all forms (admin only)
curl -H "X-WP-Nonce: YOUR_NONCE" \
  http://localhost/wp-json/devlayer-form/v1/forms

# Create a form (admin only)
curl -X POST -H "X-WP-Nonce: YOUR_NONCE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Form","slug":"test-form","schema":{}}' \
  http://localhost/wp-json/devlayer-form/v1/forms

# Submit a form (public)
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}' \
  http://localhost/wp-json/devlayer-form/v1/submissions
```

## Uninstall Testing

To test uninstall cleanup:

1. Delete the plugin using the WordPress admin interface
2. Choose "Delete plugin and data"
3. Verify that the database tables are removed:
   - `wp_devlayer_forms` should be deleted
   - `wp_devlayer_submissions` should be deleted
   - Option `devlayer_form_db_version` should be removed

## WordPress Compatibility

Minimum Requirements:
- WordPress: 5.9+
- PHP: 7.4+

## Notes

- The plugin uses soft deletes by default to preserve submission data
- GDPR-compliant cascade deletion removes submissions when form is permanently deleted
- All database operations use prepared statements for SQL injection prevention
- IP addresses are validated and limited to 45 characters
- User agent strings are limited to 255 characters
