# DevLayer Form Plugin - Installation Guide

## Quick Start

### 1. Installation

1. Copy the `devlayer-form` folder to your WordPress plugins directory:
   ```
   /wp-content/plugins/devlayer-form/
   ```

2. Navigate to **Plugins** in the WordPress admin panel

3. Find "DevLayer Form" in the plugin list

4. Click **Activate**

### 2. Verification

After activation, verify the plugin is working:

1. Check the WordPress admin for any error notices
2. No errors should appear on the dashboard

The plugin will automatically:
- Create `wp_devlayer_forms` table for form definitions
- Create `wp_devlayer_submissions` table for submissions
- Set the database version option
- Register REST API endpoints
- Register shortcode handlers
- Set up script/style enqueueing

## Database Tables Created

### wp_devlayer_forms
Stores form definitions and metadata:
- Automatic soft-delete support for GDPR compliance
- JSON schema storage for flexible form definitions
- Timestamps for audit trail
- Slug-based unique identification

### wp_devlayer_submissions
Stores user form submissions:
- Foreign key constraint with cascade delete
- IP address and user agent tracking
- User ID tracking (when logged in)
- JSON data storage for flexible submission formats

## Plugin Structure

```
devlayer-form/
├── devlayer-form.php              # Main plugin file
├── includes/
│   ├── class-database.php          # Database CRUD operations (implemented)
│   ├── class-forms.php             # Form management (scaffold)
│   ├── class-fields.php            # Field registry (scaffold)
│   ├── class-submissions.php       # Submission handling (scaffold)
│   ├── class-rest.php              # REST API endpoints (scaffold)
│   ├── class-admin.php             # Admin interface (scaffold)
│   ├── class-shortcodes.php        # Shortcode handlers (scaffold)
│   └── fields/                     # Custom field types (future)
├── assets/
│   ├── css/
│   │   ├── frontend.css            # Frontend styles (placeholder)
│   │   └── admin.css               # Admin styles (placeholder)
│   └── js/
│       ├── frontend.js             # Frontend scripts (placeholder)
│       └── admin.js                # Admin scripts (placeholder)
├── languages/                      # Localization files (future)
├── README.md                       # Plugin overview
├── DATABASE.md                     # Database documentation
├── INSTALLATION.md                 # This file
├── TESTING.md                      # Testing procedures
└── VERIFICATION.md                 # Acceptance checklist
```

## Plugin Constants

The plugin defines the following constants for use throughout:

```php
DEVLAYER_FORM_VERSION              // Plugin version (1.0.0)
DEVLAYER_FORM_PLUGIN_DIR           // Plugin directory path
DEVLAYER_FORM_PLUGIN_URL           // Plugin URL
DEVLAYER_FORM_REST_NAMESPACE       // REST API namespace (devlayer-form/v1)
```

## WordPress Requirements

- **WordPress**: 5.9 or higher
- **PHP**: 7.4 or higher
- **Database**: MySQL 5.7+ or MariaDB 10.2+

## Activation Process

When you activate the plugin, the following happens:

1. **Database Initialization**
   ```php
   DevLayer_Form_Database::activate()
   ```
   - Calls `create_tables()` using WordPress `dbDelta()`
   - Creates both database tables with proper indexes and constraints
   - Stores DB version for future migration tracking

2. **Plugin Initialization (on page load)**
   ```php
   DevLayer_Form_Plugin::init()
   ```
   - Registers REST API routes via `DevLayer_Form_REST::register_routes()`
   - Registers shortcodes via `DevLayer_Form_Shortcodes::register()`
   - Hooks script/style enqueuing

3. **Script and Style Enqueueing**
   - Frontend styles/scripts on public pages
   - Admin styles/scripts on admin pages
   - API configuration localized for JavaScript use

## Deactivation

When you deactivate the plugin:

1. `DevLayer_Form_Database::deactivate()` is called
2. Currently a no-op (preserves all data)
3. Tables remain in the database
4. Plugin can be re-activated without data loss

## Uninstall

When you delete the plugin with "Delete plugin and data" option:

1. `DevLayer_Form_Database::uninstall()` is called
2. All database tables are dropped
3. Plugin version option is removed
4. This is irreversible - backup your data first!

## Configuration

The plugin uses WordPress settings:

```php
// Database version tracking (for future migrations)
get_option('devlayer_form_db_version')
```

No additional configuration files are needed. The plugin works out-of-the-box.

## Security Considerations

The plugin implements WordPress security best practices:

- **ABSPATH Check**: All files check for WordPress environment
- **Prepared Statements**: All database queries use placeholders
- **Input Validation**: User inputs are validated and sanitized
- **Output Escaping**: Data is properly escaped when output
- **Nonce Support**: Framework for CSRF protection (ready for REST endpoints)
- **Capability Checks**: Role-based access control patterns (ready for implementation)

## Common Issues

### Plugin Not Activated

**Problem**: Plugin activation fails with error

**Solution**:
1. Check WordPress debug log in `/wp-content/debug.log`
2. Ensure all files are properly uploaded
3. Verify PHP version is 7.4+
4. Check database connection

### Tables Not Created

**Problem**: Database tables don't appear after activation

**Solution**:
1. Check database user has CREATE TABLE privilege
2. Try deactivating and re-activating
3. Run `DevLayer_Form_Database::create_tables()` manually in code
4. Check WordPress database error logs

### Script Errors

**Problem**: JavaScript errors in admin or frontend

**Solution**:
1. Check browser console for specific errors
2. Verify asset files exist in `assets/` directory
3. Check for conflicts with other plugins
4. Ensure proper enqueue dependency order

## Next Steps

After successful installation:

1. **Implement REST API**
   - Add form CRUD endpoints in `class-rest.php`
   - Add submission endpoints
   - Add authentication/authorization

2. **Build Admin Interface**
   - Create form management UI in `class-admin.php`
   - Add form builder
   - Add submission viewer

3. **Register Shortcodes**
   - Implement `[devlayer-form]` shortcode in `class-shortcodes.php`
   - Create form display template

4. **Extend Field Types**
   - Add custom field implementations in `includes/fields/`
   - Register with field registry in `class-fields.php`

5. **Add Localization**
   - Create `.pot` file for translations
   - Add language files in `languages/` directory

## Troubleshooting

### Enable Debug Mode

To help diagnose issues, enable WordPress debug:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Then check `/wp-content/debug.log` for errors.

### Check Database Directly

```sql
-- Verify tables exist
SHOW TABLES LIKE 'wp_devlayer%';

-- Check table structure
DESCRIBE wp_devlayer_forms;
DESCRIBE wp_devlayer_submissions;

-- Check plugin option
SELECT option_value FROM wp_options WHERE option_name = 'devlayer_form_db_version';
```

### Test Database Connection

```php
global $wpdb;
echo $wpdb->get_results("SHOW TABLES;"); // Should display tables
```

## Support

For issues or questions:

1. Check the documentation in this plugin folder
2. Review the DATABASE.md for schema details
3. Check TESTING.md for testing procedures
4. Enable WordPress debug mode for more detailed error messages

## Backup Before Uninstall

**IMPORTANT**: Before uninstalling the plugin, backup your database if you have any forms or submissions you want to preserve.

```bash
# MySQL backup
mysqldump -u your_user -p your_database > backup.sql

# Or use a WordPress backup plugin
```

The uninstall hook will permanently delete:
- `wp_devlayer_forms` table
- `wp_devlayer_submissions` table
- `devlayer_form_db_version` option

This action cannot be undone!
