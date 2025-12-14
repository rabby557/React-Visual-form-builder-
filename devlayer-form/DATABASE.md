# DevLayer Form - Database Documentation

## Overview

DevLayer Form uses two primary database tables to store form definitions and user submissions. The database layer is implemented in `includes/class-database.php` and handles all CRUD operations using WordPress prepared statements.

## Database Tables

### wp_devlayer_forms

Stores form definitions and metadata.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT(20) unsigned | Primary key, auto-incrementing form ID |
| `title` | VARCHAR(255) | Form title/label |
| `slug` | VARCHAR(255) UNIQUE | URL-friendly identifier |
| `schema` | LONGTEXT | JSON-encoded form schema containing field definitions |
| `created_at` | DATETIME | Timestamp when form was created (defaults to current time) |
| `updated_at` | DATETIME | Timestamp of last modification (auto-updates on change) |
| `deleted_at` | DATETIME NULL | Soft delete timestamp (NULL if form is active) |

**Indexes:**
- `PRIMARY KEY (id)` - For fast form lookups by ID
- `KEY slug_index (slug)` - For fast lookup by slug
- `KEY created_at_index (created_at)` - For chronological queries

**Charset:** WordPress default (typically utf8mb4)
**Collation:** WordPress default (typically utf8mb4_unicode_ci)

### wp_devlayer_submissions

Stores user form submissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT(20) unsigned | Primary key, auto-incrementing submission ID |
| `form_id` | BIGINT(20) unsigned | Foreign key reference to wp_devlayer_forms.id |
| `data` | LONGTEXT | JSON-encoded submission data |
| `ip_address` | VARCHAR(45) NULL | Client IP address (IPv4 or IPv6) |
| `user_agent` | VARCHAR(255) NULL | Client browser user agent string |
| `user_id` | BIGINT(20) unsigned NULL | WordPress user ID (NULL if not logged in) |
| `created_at` | DATETIME | Timestamp when submission was created |

**Indexes:**
- `PRIMARY KEY (id)` - For fast submission lookups by ID
- `KEY form_id_index (form_id)` - For fast lookup of submissions by form
- `KEY created_at_index (created_at)` - For chronological queries

**Foreign Key:**
- `FOREIGN KEY (form_id) REFERENCES wp_devlayer_forms(id) ON DELETE CASCADE`
  - Ensures referential integrity
  - Automatically deletes submissions when form is permanently deleted
  - GDPR-compliant cascade deletion

**Charset:** WordPress default (typically utf8mb4)
**Collation:** WordPress default (typically utf8mb4_unicode_ci)

## Soft Delete Pattern

The plugin uses a soft delete pattern for forms to preserve submission history and ensure GDPR compliance:

- **Soft Delete:** Sets `deleted_at` timestamp; form data is preserved
- **Hard Delete:** Available via `permanently_delete_form()` for explicit cleanup
- **Query Impact:** All `SELECT` queries include `WHERE deleted_at IS NULL`

Example:
```php
// Soft delete (default)
DevLayer_Form_Database::delete_form($form_id);
// Form is marked as deleted but data is preserved

// Permanent delete
DevLayer_Form_Database::permanently_delete_form($form_id);
// Form and all submissions are completely removed
```

## GDPR Compliance

The database design includes features for GDPR compliance:

### Data Minimization
- IP addresses: Limited to 45 characters
- User agents: Limited to 255 characters
- Only necessary data fields stored

### Right to Be Forgotten
- Soft delete allows logical removal of forms without data loss
- Permanent delete cascades to submissions
- Future: Submission data export and purge functionality

### Data Integrity
- Foreign key constraints prevent orphaned submissions
- Timestamps track data lifecycle
- User ID tracking for logged-in submissions

## Database Methods

### Form Operations

#### `create_tables()`
Creates both database tables with proper schema, indexes, and constraints.

```php
DevLayer_Form_Database::create_tables();
```

#### `get_form($form_id)`
Retrieves a single active form by ID.

```php
$form = DevLayer_Form_Database::get_form($form_id);
// Returns: stdObject with decoded schema
```

#### `get_form_by_slug($slug)`
Retrieves a single active form by slug.

```php
$form = DevLayer_Form_Database::get_form_by_slug('contact-form');
```

#### `get_all_forms()`
Retrieves all active forms ordered by creation date.

```php
$forms = DevLayer_Form_Database::get_all_forms();
// Returns: array of form objects
```

#### `create_form($title, $slug, $schema)`
Creates a new form with provided schema.

```php
$form_id = DevLayer_Form_Database::create_form(
    'Contact Form',
    'contact-form',
    array('fields' => array(...))
);
```

#### `update_form($form_id, $title, $schema)`
Updates form title and schema.

```php
$success = DevLayer_Form_Database::update_form(
    $form_id,
    'Updated Title',
    $new_schema
);
```

#### `delete_form($form_id)`
Soft deletes a form (preserves submission data).

```php
$success = DevLayer_Form_Database::delete_form($form_id);
```

#### `permanently_delete_form($form_id)`
Permanently deletes form and cascades to submissions.

```php
$success = DevLayer_Form_Database::permanently_delete_form($form_id);
```

### Submission Operations

#### `create_submission($form_id, $data)`
Creates a new submission for a form.

```php
$submission_id = DevLayer_Form_Database::create_submission(
    $form_id,
    array('name' => 'John', 'email' => 'john@example.com')
);
```

Automatically captures:
- Client IP address (GDPR-validated)
- User agent string
- Current user ID (if logged in)
- Creation timestamp

Fires action hook: `devlayer_form_submission_created`

#### `get_form_submissions($form_id, $limit = 100, $offset = 0)`
Retrieves submissions for a form with pagination.

```php
$submissions = DevLayer_Form_Database::get_form_submissions(
    $form_id,
    50,  // limit
    0    // offset
);
```

#### `delete_submission($submission_id)`
Deletes a specific submission.

```php
$success = DevLayer_Form_Database::delete_submission($submission_id);
```

### Utility Methods

#### `get_client_ip()`
Extracts and validates client IP address.

```php
$ip = DevLayer_Form_Database::get_client_ip();
// Returns: valid IPv4 or IPv6, or '0.0.0.0' if invalid
```

Handles:
- Direct connection (REMOTE_ADDR)
- Proxied connections (X-Forwarded-For)
- Load balancer scenarios (HTTP_CLIENT_IP)
- IPv6 addresses
- Validation using FILTER_VALIDATE_IP

## Activation and Deactivation

### Activation Hook
```php
DevLayer_Form_Database::activate()
```
- Creates both database tables
- Sets DB version option for future migrations
- Called via `register_activation_hook()`

### Deactivation Hook
```php
DevLayer_Form_Database::deactivate()
```
- Currently a no-op
- Preserves all data when plugin is deactivated
- Can be extended for cleanup tasks in future

### Uninstall Hook
```php
DevLayer_Form_Database::uninstall()
```
- Drops both database tables
- Removes version option
- Called when plugin is deleted with "Delete plugin and data" option

## SQL Examples

### View all active forms
```sql
SELECT * FROM wp_devlayer_forms WHERE deleted_at IS NULL ORDER BY created_at DESC;
```

### View all submissions for a form
```sql
SELECT * FROM wp_devlayer_submissions WHERE form_id = 1 ORDER BY created_at DESC;
```

### Count submissions per form
```sql
SELECT form_id, COUNT(*) as submission_count
FROM wp_devlayer_submissions
GROUP BY form_id
ORDER BY submission_count DESC;
```

### Find deleted forms
```sql
SELECT * FROM wp_devlayer_forms WHERE deleted_at IS NOT NULL;
```

### View cascade delete in action
```sql
-- When a form is permanently deleted:
DELETE FROM wp_devlayer_submissions WHERE form_id = 1;  -- Auto cascaded
DELETE FROM wp_devlayer_forms WHERE id = 1;            -- Form deleted
```

## Performance Considerations

- **Indexes:** All frequently queried columns are indexed
- **LONGTEXT fields:** Used for JSON schema and data (appropriate for variable length)
- **VARCHAR limits:** IP (45), User Agent (255) - matches storage needs
- **Foreign Keys:** Ensure data integrity with minimal overhead
- **Prepared Statements:** All queries use placeholders to prevent SQL injection

## Future Enhancements

1. **Submission Archival:** Move old submissions to archive table
2. **Submission Expiry:** Automatic deletion of submissions older than X days
3. **Form Versioning:** Track schema changes over time
4. **Audit Logging:** Log all form and submission changes
5. **Data Anonymization:** Remove PII from old submissions
6. **Submission Search:** Full-text search on submission data
