# Deployment Guide

Instructions for deploying the Form Builder WordPress plugin to production environments.

## Pre-Deployment Checklist

- [ ] All code reviewed and tested
- [ ] Database migrations tested
- [ ] REST API endpoints verified
- [ ] React app built and bundled
- [ ] Environment variables configured
- [ ] Security headers configured
- [ ] CORS settings appropriate
- [ ] Email settings configured
- [ ] Backups created
- [ ] DNS/domain ready
- [ ] SSL certificate valid
- [ ] PHP version compatible (7.4+)
- [ ] WordPress version compatible (5.0+)

## Deployment Steps

### Step 1: Prepare Deployment Package

```bash
# Create deployment directory
mkdir -p form-builder-deployment
cd form-builder-deployment

# Copy plugin files
cp -r ../wordpress-plugin/form-builder ./

# Remove unnecessary files
rm form-builder/.git
rm form-builder/.gitignore
rm form-builder/node_modules (if any)

# Build React app (if not already built)
cd form-builder
npm run build
cp -r dist/* assets/dist/
cd ..

# Create deployment archive
tar -czf form-builder-v1.0.0.tar.gz form-builder/
```

### Step 2: Upload to Production Server

#### Using SFTP

```bash
sftp user@production-server.com
cd /var/www/html/wp-content/plugins
put form-builder-v1.0.0.tar.gz
exit

# Then SSH to extract
ssh user@production-server.com
cd /var/www/html/wp-content/plugins
tar -xzf form-builder-v1.0.0.tar.gz
rm form-builder-v1.0.0.tar.gz
chmod 755 form-builder
```

#### Using Git

```bash
# On production server
cd /var/www/html/wp-content/plugins
git clone https://github.com/your-org/form-builder.git
cd form-builder
git checkout v1.0.0
chmod 755 .
```

#### Using Composer (if applicable)

```json
{
  "require": {
    "wpackagist-plugin/form-builder": "1.0.0"
  }
}
```

Then: `composer install`

### Step 3: Configure Environment

#### Create WordPress Configuration

```bash
# SSH to production
ssh user@production-server.com

# Create wp-cli config (optional but recommended)
cat > wp-cli.yml << 'EOF'
path: /var/www/html
url: https://example.com
EOF

# Activate plugin
wp plugin activate form-builder

# Verify tables created
wp db query "SHOW TABLES LIKE 'wp_form_builder_%';"

# Set options
wp option update form_builder_enable_email_notifications 1
wp option update form_builder_admin_email admin@example.com
```

#### Configure web server

**nginx Configuration:**

```nginx
# Add to your nginx server block
location /wp-json/form-builder {
    # Allow methods
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, X-WP-Nonce' always;
        add_header 'Access-Control-Max-Age' '86400' always;
        return 204;
    }

    # CORS headers for actual requests
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, X-WP-Nonce' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Rate limiting (optional)
    limit_req zone=form_submit burst=20 nodelay;

    try_files $uri $uri/ /index.php?$args;
}

# Create rate limiting zone
limit_req_zone $binary_remote_addr zone=form_submit:10m rate=10r/s;
```

**Apache Configuration:**

```apache
<Location /wp-json/form-builder>
    # Allow CORS
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, X-WP-Nonce"
    Header set Access-Control-Allow-Credentials "true"

    # Rate limiting (using mod_ratelimit)
    SetEnvIf Request_URI "^/wp-json/form-builder/v1/submissions" LIMIT
    <If "%{ENV:LIMIT}">
        RateLimit 100 per second
    </If>
</Location>
```

### Step 4: Configure React App

```bash
# On production server (or wherever React app is hosted)
export VITE_WORDPRESS_API_URL="https://your-wordpress-domain.com"
export VITE_FORM_BUILDER_NAMESPACE="form-builder/v1"
export VITE_DEBUG="false"
```

Or in `.env.production`:

```env
VITE_WORDPRESS_API_URL=https://your-wordpress-domain.com
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1
VITE_DEBUG=false
```

### Step 5: Test Deployment

```bash
# SSH to production
ssh user@production-server.com

# Verify plugin is active
wp plugin is-active form-builder

# Test database
wp db query "SELECT COUNT(*) FROM wp_form_builder_forms;"

# Test REST endpoint
wp eval 'echo json_encode(Form_Builder_Database::get_all_forms());'

# Test from outside the server
curl https://your-domain.com/wp-json/form-builder/v1/forms/slug/test

# Verify no PHP errors
tail -f wp-content/debug.log
```

## Production Configuration

### PHP Settings (php.ini)

```ini
# For form processing
post_max_size = 20M
upload_max_filesize = 20M
max_input_vars = 3000

# Performance
max_execution_time = 300
memory_limit = 256M
default_socket_timeout = 300

# Security
expose_php = Off
disable_functions = exec,passthru,shell_exec,system
```

### WordPress Configuration (wp-config.php)

```php
// Security
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);

// Performance
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Debug (disable in production)
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// Cache (if using cache)
define('WP_CACHE', true);
```

### Database Optimization

```sql
-- Run on production database
-- Optimize tables
OPTIMIZE TABLE wp_form_builder_forms;
OPTIMIZE TABLE wp_form_builder_submissions;

-- Add indexes
ALTER TABLE wp_form_builder_forms ADD INDEX idx_slug (slug);
ALTER TABLE wp_form_builder_forms ADD INDEX idx_created (created_at);
ALTER TABLE wp_form_builder_submissions ADD INDEX idx_form_date (form_id, created_at);

-- Set up automated maintenance
-- (Configure in hosting panel or cron job)
```

### Cron Job for Cleanup

```bash
# Edit crontab
crontab -e

# Add cleanup job (daily)
0 2 * * * wp db query "DELETE FROM wp_form_builder_submissions WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);"

# Or via WordPress built-in scheduler
0 */6 * * * wp core security:check
```

## SSL/HTTPS Configuration

### Enable HTTPS

```bash
# Redirect HTTP to HTTPS in wp-config.php
define('WP_HOME', 'https://example.com');
define('WP_SITEURL', 'https://example.com');

# Or in .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

### Security Headers

```apache
# In Apache .htaccess or vhost
Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

Or in nginx:

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Email Configuration

### Configure WordPress Mail

```php
// Install WP Mail SMTP plugin or configure manually

// In wp-config.php or functions.php
define('WPMAIL_FROM', 'noreply@example.com');
define('WPMAIL_FROM_NAME', 'Your Site');
```

### Test Email

```bash
wp eval 'wp_mail("test@example.com", "Test", "This is a test email.");'
```

## Monitoring & Logging

### Enable Monitoring

```bash
# SSH to server
ssh user@production-server.com

# Create monitoring script
cat > /usr/local/bin/monitor-form-builder.sh << 'EOF'
#!/bin/bash

# Check if plugin is active
wp plugin is-active form-builder || echo "WARNING: Plugin not active"

# Check database
wp db query "SELECT COUNT(*) FROM wp_form_builder_forms;" || echo "ERROR: Database issue"

# Check REST API
curl -s https://your-domain.com/wp-json/form-builder/v1/forms/slug/test | jq '.success' || echo "ERROR: API issue"

# Check file permissions
if [ ! -w "/var/www/html/wp-content/plugins/form-builder" ]; then
    echo "ERROR: Plugin directory not writable"
fi
EOF

chmod +x /usr/local/bin/monitor-form-builder.sh

# Add to crontab
crontab -e
# Add: 0 * * * * /usr/local/bin/monitor-form-builder.sh >> /var/log/form-builder-monitor.log 2>&1
```

### Log Rotation

```bash
# Create logrotate config
cat > /etc/logrotate.d/form-builder << 'EOF'
/var/log/form-builder-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
EOF
```

## Backup & Recovery

### Automated Backups

```bash
# Backup script
cat > /usr/local/bin/backup-form-builder.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/backups/form-builder"
DATE=$(date +%Y%m%d-%H%M%S)
WORDPRESS_DIR="/var/www/html"

mkdir -p $BACKUP_DIR

# Backup database
wp db export $BACKUP_DIR/database-$DATE.sql

# Backup plugin files
tar -czf $BACKUP_DIR/plugin-$DATE.tar.gz -C $WORDPRESS_DIR/wp-content/plugins form-builder

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup-form-builder.sh

# Schedule daily backups
crontab -e
# Add: 0 3 * * * /usr/local/bin/backup-form-builder.sh
```

### Recovery from Backup

```bash
# Restore database
mysql wordpress < /backups/form-builder/database-20240101-120000.sql

# Restore plugin files
cd /var/www/html/wp-content/plugins
rm -rf form-builder
tar -xzf /backups/form-builder/plugin-20240101-120000.tar.gz

# Verify
wp plugin is-active form-builder
wp db query "SELECT COUNT(*) FROM wp_form_builder_forms;"
```

## Performance Optimization

### Caching

```php
// In wp-config.php or functions.php

// Cache form schemas for 1 hour
add_filter('form_builder_get_form_cache_ttl', function() {
    return 3600;
});

// Implement caching in REST responses
function cache_form_response($response) {
    return rest_ensure_response($response)
        ->header('Cache-Control', 'public, max-age=3600');
}
```

### CDN Integration

```php
// Use CDN for assets
define('FORM_BUILDER_CDN_URL', 'https://cdn.example.com');

// Modify asset URLs
add_filter('form_builder_plugin_url', function($url) {
    if (defined('FORM_BUILDER_CDN_URL')) {
        return str_replace(home_url(), FORM_BUILDER_CDN_URL, $url);
    }
    return $url;
});
```

### Database Optimization

```sql
-- Monitor query performance
SHOW PROCESSLIST;

-- Analyze slow queries
SHOW VARIABLES LIKE 'slow_query_log%';
SET GLOBAL slow_query_log = 'ON';

-- Check table fragmentation
SELECT TABLE_NAME, DATA_FREE FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'wordpress' AND TABLE_NAME LIKE 'wp_form_builder%';

-- Defragment tables
OPTIMIZE TABLE wp_form_builder_forms;
OPTIMIZE TABLE wp_form_builder_submissions;
```

## Rollback Procedure

If deployment fails:

```bash
# SSH to production
ssh user@production-server.com

# Deactivate current version
wp plugin deactivate form-builder

# Remove current version
rm -rf /var/www/html/wp-content/plugins/form-builder

# Restore previous version
tar -xzf /backups/form-builder/plugin-previous.tar.gz -C /var/www/html/wp-content/plugins

# Restore previous database
mysql wordpress < /backups/form-builder/database-previous.sql

# Reactivate
wp plugin activate form-builder

# Verify
wp plugin is-active form-builder
```

## Monitoring Commands

```bash
# Check plugin status
wp plugin status form-builder

# View recent errors
tail -f /var/www/html/wp-content/debug.log

# Check database size
wp db size

# Check form count
wp db query "SELECT COUNT(*) as total FROM wp_form_builder_forms;"

# Check submission count
wp db query "SELECT COUNT(*) as total FROM wp_form_builder_submissions;"

# Verify REST routes
wp rest-api route list | grep form-builder

# Check slow queries
wp db query "SELECT * FROM mysql.slow_log LIMIT 10;"
```

## Post-Deployment Verification

Run this checklist after deployment:

```bash
#!/bin/bash

echo "Post-Deployment Verification"
echo "=============================="

# 1. Plugin active
echo "1. Checking plugin status..."
wp plugin is-active form-builder && echo "✓ Plugin is active" || echo "✗ Plugin not active"

# 2. Database tables exist
echo "2. Checking database tables..."
wp db query "SHOW TABLES LIKE 'wp_form_builder_%';" | grep form_builder && echo "✓ Database tables exist" || echo "✗ Database tables missing"

# 3. REST endpoints available
echo "3. Checking REST endpoints..."
wp rest-api route list | grep form-builder > /dev/null && echo "✓ REST routes registered" || echo "✗ REST routes not found"

# 4. Form retrieval works
echo "4. Testing form retrieval..."
curl -s https://example.com/wp-json/form-builder/v1/forms/slug/test | jq '.success' && echo "✓ Form retrieval works" || echo "✗ Form retrieval failed"

# 5. Email configuration
echo "5. Checking email configuration..."
wp option get form_builder_enable_email_notifications && echo "✓ Email notifications enabled" || echo "✗ Email notifications disabled"

# 6. No PHP errors
echo "6. Checking for PHP errors..."
tail -20 wp-content/debug.log | grep -i error && echo "✗ Errors found in log" || echo "✓ No recent errors"

echo ""
echo "Verification complete!"
```

## Support & Troubleshooting

For deployment issues, check:

1. **System logs:** `/var/log/syslog` or `/var/log/messages`
2. **Web server logs:** `/var/log/apache2/` or `/var/log/nginx/`
3. **WordPress logs:** `wp-content/debug.log`
4. **PHP logs:** `/var/log/php-errors.log`
5. **Database logs:** MySQL error log

See [README.md](./README.md) for complete documentation.
