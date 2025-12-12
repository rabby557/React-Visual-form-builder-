# Installation Guide

Complete step-by-step instructions for installing and configuring the Form Builder WordPress plugin.

## System Requirements

- **WordPress:** 5.0 or higher
- **PHP:** 7.4 or higher
- **MySQL:** 5.7 or higher (or MariaDB 10.3+)
- **WordPress REST API:** Enabled (default in WordPress 4.7+)

## Installation Methods

### Method 1: Manual Installation (Recommended)

1. **Download the plugin files**
   ```bash
   cd /path/to/wordpress/wp-content/plugins/
   cp -r /path/to/form-builder ./form-builder
   ```

2. **Activate the plugin**
   - Log in to WordPress admin dashboard
   - Go to Plugins > Installed Plugins
   - Find "Form Builder" in the list
   - Click "Activate"

3. **Verify installation**
   - The plugin should activate without errors
   - Database tables will be created automatically
   - Check that REST endpoints are accessible:
     ```bash
     curl https://your-site.com/wp-json/form-builder/v1/forms
     ```

### Method 2: WP-CLI Installation

```bash
# Navigate to WordPress root
cd /path/to/wordpress

# Copy plugin
cp -r /path/to/form-builder wp-content/plugins/

# Activate plugin
wp plugin activate form-builder

# Verify activation
wp plugin is-active form-builder
```

### Method 3: Docker Installation

If using Docker for WordPress development:

```dockerfile
FROM wordpress:latest

# Copy plugin
COPY form-builder /var/www/html/wp-content/plugins/form-builder

# Activate plugin (using entrypoint script)
RUN wp plugin activate form-builder --allow-root
```

## Post-Installation Setup

### 1. Database Verification

Verify that the database tables were created:

```bash
# Using WP-CLI
wp db query "SELECT * FROM $(wp db prefix)form_builder_forms LIMIT 1;"

# Or using MySQL directly
mysql -u wordpress_user -p wordpress_db -e "SHOW TABLES LIKE 'wp_form_builder_%';"
```

**Expected output:** Two tables
- `wp_form_builder_forms`
- `wp_form_builder_submissions`

### 2. REST API Testing

Test that the plugin's REST endpoints are accessible:

```bash
# List forms endpoint
curl -X GET \
  https://your-site.com/wp-json/form-builder/v1/forms \
  -H "Content-Type: application/json"

# Expected response (403 if not authenticated, which is normal)
```

### 3. Configure React App

Update the React app's environment variables:

```bash
# In the React app directory
cp wordpress-plugin/.env.example .env.local

# Edit .env.local
VITE_WORDPRESS_API_URL=https://your-site.com
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1
VITE_DEBUG=false
```

### 4. Build React Assets

Build the React app and copy assets to the plugin:

```bash
# In React app directory
npm install
npm run build

# The build outputs to dist/ directory
# Copy to plugin assets (optional, for embedding)
cp -r dist/* ../wordpress-plugin/assets/dist/
```

### 5. Enable Plugin Features (Optional)

**Email Notifications**

By default, email notifications are enabled. To verify or disable:

```bash
# Check current setting
wp option get form_builder_enable_email_notifications

# Enable
wp option update form_builder_enable_email_notifications 1

# Disable
wp option update form_builder_enable_email_notifications 0
```

## Troubleshooting Installation

### Plugin doesn't activate

**Error:** "Fatal error: Cannot redeclare class"

**Solution:** 
- Check that no other plugin is defining the same class
- Clear WordPress cache: `wp cache flush`
- Try deactivating conflicting plugins

**Error:** "Permission denied" when creating database tables

**Solution:**
- Ensure WordPress database user has CREATE TABLE permissions
- Contact your hosting provider if using managed WordPress

### REST endpoints return 404

**Error:** "REST route not found"

**Solution:**
1. Verify WordPress REST API is enabled:
   ```bash
   wp rest-api route list | grep form-builder
   ```

2. Flush permalinks:
   ```bash
   wp rewrite flush
   ```

3. Check mod_rewrite is enabled (Apache):
   ```bash
   a2enmod rewrite
   systemctl restart apache2
   ```

### Database tables not created

**Error:** Tables don't appear after activation

**Solution:**
1. Manually trigger table creation:
   ```bash
   wp eval 'Form_Builder_Database::create_tables();'
   ```

2. Verify database connection:
   ```bash
   wp db check
   ```

## Configuration Settings

### WordPress Options

Configure the plugin via WordPress options:

```php
// In wp-config.php or via wp-cli

// Enable/disable email notifications
update_option('form_builder_enable_email_notifications', true);

// Set admin email for form submissions
update_option('form_builder_admin_email', 'admin@example.com');
```

Or via WP-CLI:

```bash
wp option update form_builder_enable_email_notifications 1
wp option update form_builder_admin_email admin@example.com
```

### PHP Settings

For better compatibility with large forms, adjust PHP settings:

In `php.ini` or `.htaccess`:

```ini
; Allow larger JSON payloads for forms
post_max_size = 20M
upload_max_filesize = 20M

; Increase memory for form processing
memory_limit = 256M

; Increase execution time for large operations
max_execution_time = 300
```

### WordPress Constants

Add to `wp-config.php` if needed:

```php
// Disable REST API (not recommended if using plugin)
// define('REST_API_ENABLED', false);

// Disable REST API for non-authenticated users (more restrictive)
// define('REST_API_PUBLIC', false);

// Debug REST API issues
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

## Security Configuration

### 1. CORS Setup (if React app is on different domain)

Add to `wp-config.php`:

```php
// Allow CORS from specific domain
header('Access-Control-Allow-Origin: https://app.example.com');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce');
header('Access-Control-Allow-Credentials: true');
```

Or configure at web server level (nginx example):

```nginx
location /wp-json/form-builder {
    add_header Access-Control-Allow-Origin "https://app.example.com";
    add_header Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, X-WP-Nonce";
    add_header Access-Control-Allow-Credentials "true";
}
```

### 2. Nonce Security

The plugin uses WordPress nonces for CSRF protection. Ensure:

```php
// Nonces are automatically handled by WordPress REST API
// Verify in requests:
wp_verify_nonce($_REQUEST['_wpnonce'], 'wp_rest');
```

### 3. Rate Limiting

Implement rate limiting at reverse proxy level (recommended):

**nginx example:**
```nginx
limit_req_zone $binary_remote_addr zone=form_submit:10m rate=10r/s;

location /wp-json/form-builder/v1/submissions {
    limit_req zone=form_submit burst=20 nodelay;
}
```

**Apache example:**
```apache
<Location /wp-json/form-builder/v1/submissions>
    SetEnvIfExpr "%{HTTP_METHOD} == 'POST'" LIMIT_POST=1
    Order Allow,Deny
    Allow from all
</Location>
```

## Verification Checklist

After installation, verify everything works:

- [ ] Plugin appears in Installed Plugins list
- [ ] Plugin activates without errors
- [ ] Database tables created:
  ```bash
  wp db query "SHOW TABLES LIKE 'wp_form_builder_%';"
  ```
- [ ] REST endpoints accessible:
  ```bash
  curl https://your-site.com/wp-json/form-builder/v1
  ```
- [ ] Can list forms (if authenticated):
  ```bash
  wp eval 'echo json_encode(Form_Builder_Database::get_all_forms());'
  ```
- [ ] Email notifications enabled:
  ```bash
  wp option get form_builder_enable_email_notifications
  ```
- [ ] React app can reach REST API
- [ ] Shortcode works: Create page with `[form-builder slug="test"]`

## Uninstallation

### Safe Uninstallation (Keep Data)

```bash
# Deactivate plugin
wp plugin deactivate form-builder

# Delete plugin files
rm -rf wp-content/plugins/form-builder

# Data remains in database (soft-deleted forms, submissions)
```

### Complete Uninstallation (Remove Data)

```bash
# Deactivate and delete plugin
wp plugin delete form-builder

# Drop database tables (WARNING: deletes all forms and submissions)
wp db query "DROP TABLE IF EXISTS wp_form_builder_forms;"
wp db query "DROP TABLE IF EXISTS wp_form_builder_submissions;"
```

## Upgrade Instructions

### From v0.x to v1.x

1. **Backup database**
   ```bash
   wp db export backup-$(date +%Y%m%d-%H%M%S).sql
   ```

2. **Deactivate current version**
   ```bash
   wp plugin deactivate form-builder
   ```

3. **Update plugin files**
   ```bash
   cp -r form-builder-v1 wp-content/plugins/form-builder
   ```

4. **Activate new version**
   ```bash
   wp plugin activate form-builder
   ```

5. **Run database migration** (if needed)
   ```bash
   wp eval 'Form_Builder_Database::create_tables();'
   ```

6. **Verify functionality**
   - Test REST endpoints
   - Check form data integrity
   - Test form submissions

## Next Steps

After successful installation:

1. **Access the React builder:** Navigate to your React app URL
2. **Create a test form:** Use the form builder to create a simple form
3. **Embed on page:** Add shortcode `[form-builder slug="test"]` to a WordPress page
4. **Test submission:** Submit the form and verify in admin
5. **Review settings:** Customize email notifications and other features

## Support & Troubleshooting

For installation issues:

1. **Check WordPress error log:**
   ```bash
   tail -f wp-content/debug.log
   ```

2. **Verify plugin permissions:**
   ```bash
   wp plugin list
   wp plugin status form-builder
   ```

3. **Test REST API:**
   ```bash
   wp rest-api route list --format=table | grep form-builder
   ```

4. **Review activation errors:**
   ```bash
   # Temporarily enable debug mode
   wp config set WP_DEBUG true --raw
   wp plugin activate form-builder
   wp config set WP_DEBUG false --raw
   ```

5. **Check PHP compatibility:**
   ```bash
   php -v
   ```

For detailed setup information, see:
- [README.md](./README.md) - Plugin overview
- [INTEGRATION.md](./INTEGRATION.md) - React integration guide
- [API_CONTRACT.md](./API_CONTRACT.md) - Complete API specification
