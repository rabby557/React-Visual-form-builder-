# Form Builder WordPress Plugin - Documentation Index

Complete documentation for the Form Builder WordPress plugin, providing REST API endpoints for form management and submissions.

## Quick Links

- **[README.md](./README.md)** - Plugin overview, features, and basic setup
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[INSTALLATION.md](./INSTALLATION.md)** - Detailed installation instructions
- **[INTEGRATION.md](./INTEGRATION.md)** - React app integration guide
- **[API_CONTRACT.md](./API_CONTRACT.md)** - Complete API specification
- **[TESTING.md](./TESTING.md)** - Testing procedures and test cases
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide

## Documentation Overview

### For Developers

Start here if you're integrating the Form Builder with your WordPress site:

1. **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running in 5 minutes
2. **[INSTALLATION.md](./INSTALLATION.md)** - Detailed setup steps
3. **[INTEGRATION.md](./INTEGRATION.md)** - How the React app talks to WordPress
4. **[API_CONTRACT.md](./API_CONTRACT.md)** - Exact API specification for development

### For System Administrators

If you're deploying this to a production server:

1. **[INSTALLATION.md](./INSTALLATION.md)** - Server requirements and installation
2. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production setup, security, and monitoring
3. **[README.md](./README.md)** - Security considerations and configuration

### For QA/Testers

Running tests and verifying functionality:

1. **[QUICKSTART.md](./QUICKSTART.md)** - Create first test form
2. **[TESTING.md](./TESTING.md)** - Comprehensive test procedures
3. **[API_CONTRACT.md](./API_CONTRACT.md)** - Test case examples

## File Structure

```
form-builder/
├── form-builder.php                 # Main plugin file
├── includes/
│   ├── class-database.php           # Database CRUD operations
│   ├── class-rest-forms.php         # Form endpoints
│   ├── class-rest-submissions.php   # Submission endpoints
│   └── class-shortcodes.php         # WordPress shortcodes
├── assets/
│   └── dist/
│       ├── form-builder.js          # React app bundle
│       └── style.css                # Form styles
├── .env.example                     # Environment variables template
├── README.md                        # Overview & features
├── QUICKSTART.md                    # Quick setup guide
├── INSTALLATION.md                  # Installation instructions
├── INTEGRATION.md                   # React integration
├── API_CONTRACT.md                  # API specification
├── TESTING.md                       # Testing guide
├── DEPLOYMENT.md                    # Production deployment
└── INDEX.md                         # This file
```

## Key Concepts

### REST API Endpoints

The plugin exposes three main endpoint groups:

1. **Forms Management** (`/forms`)
   - List, create, update, delete forms
   - Requires authentication for admin operations
   - Public read endpoint for embedding

2. **Submissions** (`/submissions`)
   - Public submission creation
   - Admin-only submission retrieval
   - Email notifications on submission

3. **Shortcodes**
   - `[form-builder id="1"]` - Embed form by ID
   - `[form-builder slug="contact-form"]` - Embed form by slug

### Form Schema

Forms store their structure as JSON with two main parts:

```json
{
  "steps": [
    { "id": "step-1", "title": "Step 1", "order": 1 }
  ],
  "components": [
    {
      "id": "field-1",
      "type": "text",
      "props": { "label": "Name", "name": "name", "required": true },
      "order": 1,
      "stepId": "step-1"
    }
  ]
}
```

### Database Tables

- **wp_form_builder_forms**: Stores form schemas and metadata
- **wp_form_builder_submissions**: Stores form submissions with data

## Feature Highlights

✅ REST API for form CRUD operations  
✅ Public submission endpoints  
✅ WordPress shortcodes for embedding  
✅ Email notifications on submission  
✅ CORS support for frontend integration  
✅ Soft delete for data retention  
✅ IP and user agent tracking  
✅ WordPress hooks for extensibility  

## Quick Reference

### Installation

```bash
cp -r form-builder /path/to/wordpress/wp-content/plugins/
wp plugin activate form-builder
```

### Create a Form (API)

```bash
curl -X POST /wp-json/form-builder/v1/forms \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: {nonce}" \
  -d '{
    "title": "Contact Form",
    "slug": "contact-form",
    "schema": { ... }
  }'
```

### Embed a Form (Shortcode)

```
[form-builder slug="contact-form"]
```

### Submit Form Data (Public API)

```bash
curl -X POST /wp-json/form-builder/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": 1,
    "data": { "name": "John", "email": "john@example.com" }
  }'
```

## Configuration

### Environment Variables

```env
VITE_WORDPRESS_API_URL=https://your-site.com
VITE_FORM_BUILDER_NAMESPACE=form-builder/v1
VITE_DEBUG=false
```

### WordPress Options

```bash
wp option update form_builder_enable_email_notifications 1
wp option update form_builder_admin_email admin@example.com
```

## Security

- Nonce-based CSRF protection
- Role-based access control (manage_options)
- Input sanitization and validation
- SQL injection prevention via prepared statements
- XSS prevention through WordPress escaping functions

## Performance

- Optimized database queries with indexes
- Efficient JSON schema storage
- Pagination support for large datasets
- Caching recommendations in deployment guide

## Support Resources

| Question | See |
|----------|-----|
| How do I install the plugin? | [INSTALLATION.md](./INSTALLATION.md) |
| How do I set up the React app? | [INTEGRATION.md](./INTEGRATION.md) |
| What are the API endpoints? | [API_CONTRACT.md](./API_CONTRACT.md) |
| How do I test the plugin? | [TESTING.md](./TESTING.md) |
| How do I deploy to production? | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Quick setup? | [QUICKSTART.md](./QUICKSTART.md) |

## Troubleshooting

### Plugin won't activate
→ Check PHP version (7.4+), WordPress version (5.0+), database permissions  
→ See [INSTALLATION.md](./INSTALLATION.md#troubleshooting-installation)

### REST endpoints return 404
→ Flush permalinks: `wp rewrite flush`  
→ Check mod_rewrite enabled (Apache) or nginx config  
→ See [INSTALLATION.md](./INSTALLATION.md#rest-endpoints-return-404)

### Forms not submitting
→ Check browser console for errors  
→ Verify form ID matches database  
→ Enable debug mode: `wp config set WP_DEBUG true --raw`  
→ See [TESTING.md](./TESTING.md#troubleshooting)

### Emails not sending
→ Verify SMTP configuration  
→ Test WordPress mail: `wp eval 'wp_mail(...)'`  
→ Check form_builder_enable_email_notifications setting  
→ See [README.md](./README.md#email-notifications-not-sending)

## Version Information

- **Plugin Version**: 1.0.0
- **Minimum WordPress**: 5.0
- **Minimum PHP**: 7.4
- **Minimum MySQL**: 5.7

## API Status

| Endpoint | Status | Public |
|----------|--------|--------|
| GET /forms | Stable | No |
| GET /forms/{id} | Stable | No |
| GET /forms/slug/{slug} | Stable | Yes |
| POST /forms | Stable | No |
| POST /forms/{id} | Stable | No |
| DELETE /forms/{id} | Stable | No |
| POST /submissions | Stable | Yes |
| GET /forms/{id}/submissions | Stable | No |

## Getting Help

1. **Check relevant documentation** - Links above for each topic
2. **Review error logs** - `wp-content/debug.log`
3. **Test API endpoints** - Use cURL or Postman
4. **Check WordPress debug mode** - `wp config set WP_DEBUG true --raw`
5. **Review plugin code** - Well-commented PHP classes

## Roadmap

Potential future enhancements:

- [ ] Advanced form analytics
- [ ] Conditional logic and visibility rules
- [ ] File upload handling
- [ ] Email template builder
- [ ] CSV export for submissions
- [ ] Bulk operations API
- [ ] Form versioning
- [ ] Multi-language support

## Contributing

To contribute to the plugin:

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test thoroughly before submitting

## License

GPL v2 or later

---

**Start here:** [QUICKSTART.md](./QUICKSTART.md)
