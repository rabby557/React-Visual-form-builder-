# DevLayer Form Plugin

A standalone WordPress plugin for form management and submission handling in DevLayer.

## Overview

DevLayer Form is an independent plugin designed to manage form schemas, handle submissions, and provide REST API endpoints for form operations. This plugin is entirely self-contained and does not depend on any external builder implementation.

## Features

- **Form Management**: Create, read, update, and delete forms with customizable schemas
- **Submission Handling**: Capture and store form submissions with metadata
- **REST API**: Complete REST API for programmatic access
- **Field Registry**: Extensible field type system for custom field implementations
- **GDPR Compliance**: Soft-delete support and cascade deletion for data integrity
- **Security**: Built-in nonce verification, role-based access control, and input sanitization

## Database Tables

### wp_devlayer_forms
Stores form schemas and metadata:
- `id` - Unique form identifier
- `title` - Form title
- `slug` - URL-friendly slug (unique)
- `schema` - JSON-encoded form schema
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp (NULL if active)

### wp_devlayer_submissions
Stores form submissions:
- `id` - Unique submission identifier
- `form_id` - Reference to parent form
- `data` - JSON-encoded submission data
- `ip_address` - Client IP address (GDPR-aware)
- `user_agent` - Client user agent string
- `user_id` - WordPress user ID (if logged in)
- `created_at` - Submission timestamp

## Installation

1. Upload the `devlayer-form` folder to your WordPress plugins directory
2. Activate the plugin from the WordPress admin panel
3. Database tables will be created automatically upon activation

## Usage

### Creating a Form

```php
$form_id = DevLayer_Form_Database::create_form(
	'Contact Form',
	'contact-form',
	array(
		'fields' => array(
			array('type' => 'text', 'name' => 'name'),
			array('type' => 'email', 'name' => 'email'),
		)
	)
);
```

### Handling Submissions

```php
$submission_id = DevLayer_Form_Database::create_submission(
	$form_id,
	array('name' => 'John Doe', 'email' => 'john@example.com')
);
```

### Retrieving Forms

```php
// Get form by ID
$form = DevLayer_Form_Database::get_form($form_id);

// Get form by slug
$form = DevLayer_Form_Database::get_form_by_slug('contact-form');

// Get all forms
$forms = DevLayer_Form_Database::get_all_forms();
```

### Retrieving Submissions

```php
$submissions = DevLayer_Form_Database::get_form_submissions($form_id, 50, 0);
```

## Architecture

```
devlayer-form/
├── devlayer-form.php          # Main plugin file
├── includes/
│   ├── class-database.php      # Database operations
│   ├── class-forms.php         # Form management
│   ├── class-fields.php        # Field registry
│   ├── class-submissions.php   # Submission handling
│   ├── class-rest.php          # REST API endpoints
│   ├── class-admin.php         # Admin interface
│   ├── class-shortcodes.php    # Shortcode handlers
│   └── fields/                 # Field type implementations
├── assets/
│   ├── css/                    # Stylesheets
│   └── js/                     # JavaScript files
└── README.md                   # This file
```

## Security

The plugin implements the following security measures:

- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection Prevention**: Uses prepared statements for all database queries
- **XSS Prevention**: Implements proper output escaping
- **CSRF Protection**: Nonce verification for admin operations
- **Access Control**: Role-based permission checking (manage_options for admin)

## GDPR Compliance

- **Soft Deletes**: Forms are soft-deleted by default, preserving submission data
- **Cascade Deletion**: Submissions are automatically deleted when their parent form is permanently deleted
- **IP Logging**: IP addresses are properly validated and limited to 45 characters
- **User Agent Logging**: User agent strings are limited to 255 characters

## Hooks and Actions

### devlayer_form_submission_created

Fires after a submission is successfully created:

```php
add_action('devlayer_form_submission_created', function($submission_id, $form_id, $data) {
	// Handle new submission
}, 10, 3);
```

## Constants

- `DEVLAYER_FORM_VERSION` - Plugin version
- `DEVLAYER_FORM_PLUGIN_DIR` - Plugin directory path
- `DEVLAYER_FORM_PLUGIN_URL` - Plugin URL
- `DEVLAYER_FORM_REST_NAMESPACE` - REST API namespace

## Support

For issues, feature requests, or contributions, please refer to the main project documentation.
