<?php
/**
 * Database management for forms and submissions
 */

if (!defined('ABSPATH')) {
	exit;
}

class DevLayer_Form_Database {
	/**
	 * Database version
	 */
	const DB_VERSION = 1;

	/**
	 * Activation hook
	 */
	public static function activate() {
		self::create_tables();
		update_option('devlayer_form_db_version', self::DB_VERSION);
	}

	/**
	 * Deactivation hook
	 */
	public static function deactivate() {
		// Perform cleanup if needed (keep tables for data preservation)
	}

	/**
	 * Uninstall hook - removes all plugin data
	 */
	public static function uninstall() {
		self::drop_tables();
		delete_option('devlayer_form_db_version');
	}

	/**
	 * Create database tables for forms and submissions
	 */
	public static function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		// Forms table
		$forms_table = $wpdb->prefix . 'devlayer_forms';
		$forms_sql = "CREATE TABLE IF NOT EXISTS {$forms_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			title varchar(255) NOT NULL,
			slug varchar(255) NOT NULL UNIQUE,
			schema longtext NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			deleted_at datetime DEFAULT NULL,
			PRIMARY KEY (id),
			KEY slug_index (slug),
			KEY created_at_index (created_at)
		) {$charset_collate};";

		// Submissions table
		$submissions_table = $wpdb->prefix . 'devlayer_submissions';
		$submissions_sql = "CREATE TABLE IF NOT EXISTS {$submissions_table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			form_id bigint(20) unsigned NOT NULL,
			data longtext NOT NULL,
			ip_address varchar(45) DEFAULT NULL,
			user_agent varchar(255) DEFAULT NULL,
			user_id bigint(20) unsigned DEFAULT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY form_id_index (form_id),
			KEY created_at_index (created_at),
			FOREIGN KEY (form_id) REFERENCES {$forms_table}(id) ON DELETE CASCADE
		) {$charset_collate};";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta($forms_sql);
		dbDelta($submissions_sql);
	}

	/**
	 * Drop database tables (GDPR-compliant cleanup)
	 */
	public static function drop_tables() {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';
		$submissions_table = $wpdb->prefix . 'devlayer_submissions';

		// Drop submissions table first due to foreign key constraint
		$wpdb->query("DROP TABLE IF EXISTS {$submissions_table}");
		$wpdb->query("DROP TABLE IF EXISTS {$forms_table}");
	}

	/**
	 * Get a form by ID
	 *
	 * @param int $form_id Form ID
	 * @return object|null Form object or null
	 */
	public static function get_form($form_id) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';

		$form = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$forms_table} WHERE id = %d AND deleted_at IS NULL LIMIT 1",
				intval($form_id)
			)
		);

		if ($form) {
			$form->schema = json_decode($form->schema, true);
		}

		return $form;
	}

	/**
	 * Get a form by slug
	 *
	 * @param string $slug Form slug
	 * @return object|null Form object or null
	 */
	public static function get_form_by_slug($slug) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';

		$form = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$forms_table} WHERE slug = %s AND deleted_at IS NULL LIMIT 1",
				sanitize_text_field($slug)
			)
		);

		if ($form) {
			$form->schema = json_decode($form->schema, true);
		}

		return $form;
	}

	/**
	 * Get all forms
	 *
	 * @return array Array of form objects
	 */
	public static function get_all_forms() {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';

		$forms = $wpdb->get_results(
			"SELECT * FROM {$forms_table} WHERE deleted_at IS NULL ORDER BY created_at DESC"
		);

		if ($forms) {
			foreach ($forms as $form) {
				$form->schema = json_decode($form->schema, true);
			}
		}

		return $forms;
	}

	/**
	 * Create a new form
	 *
	 * @param string $title Form title
	 * @param string $slug Form slug
	 * @param array  $schema Form schema
	 * @return int|false Form ID or false on failure
	 */
	public static function create_form($title, $slug, $schema) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';

		$result = $wpdb->insert(
			$forms_table,
			array(
				'title' => sanitize_text_field($title),
				'slug' => sanitize_title($slug),
				'schema' => wp_json_encode($schema),
			),
			array('%s', '%s', '%s')
		);

		if ($result) {
			return $wpdb->insert_id;
		}

		return false;
	}

	/**
	 * Update a form
	 *
	 * @param int   $form_id Form ID
	 * @param string $title Form title
	 * @param array  $schema Form schema
	 * @return bool True on success, false on failure
	 */
	public static function update_form($form_id, $title, $schema) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';

		$result = $wpdb->update(
			$forms_table,
			array(
				'title' => sanitize_text_field($title),
				'schema' => wp_json_encode($schema),
			),
			array('id' => intval($form_id)),
			array('%s', '%s'),
			array('%d')
		);

		return $result !== false;
	}

	/**
	 * Delete a form (soft delete for GDPR compliance)
	 *
	 * @param int $form_id Form ID
	 * @return bool True on success, false on failure
	 */
	public static function delete_form($form_id) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';

		$result = $wpdb->update(
			$forms_table,
			array('deleted_at' => current_time('mysql')),
			array('id' => intval($form_id)),
			array('%s'),
			array('%d')
		);

		return $result !== false;
	}

	/**
	 * Permanently delete a form and all its submissions
	 *
	 * @param int $form_id Form ID
	 * @return bool True on success, false on failure
	 */
	public static function permanently_delete_form($form_id) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_forms';
		$submissions_table = $wpdb->prefix . 'devlayer_submissions';

		// Delete submissions first (cascade handled by foreign key)
		$wpdb->delete(
			$submissions_table,
			array('form_id' => intval($form_id)),
			array('%d')
		);

		// Delete form
		$result = $wpdb->delete(
			$forms_table,
			array('id' => intval($form_id)),
			array('%d')
		);

		return $result !== false;
	}

	/**
	 * Create a submission
	 *
	 * @param int   $form_id Form ID
	 * @param array $data Submission data
	 * @return int|false Submission ID or false on failure
	 */
	public static function create_submission($form_id, $data) {
		global $wpdb;

		$submissions_table = $wpdb->prefix . 'devlayer_submissions';

		$user_id = get_current_user_id();
		$user_id = $user_id ? intval($user_id) : null;

		$result = $wpdb->insert(
			$submissions_table,
			array(
				'form_id' => intval($form_id),
				'data' => wp_json_encode($data),
				'ip_address' => self::get_client_ip(),
				'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? substr(sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])), 0, 255) : '',
				'user_id' => $user_id,
			),
			array('%d', '%s', '%s', '%s', '%d')
		);

		if ($result) {
			do_action('devlayer_form_submission_created', $wpdb->insert_id, $form_id, $data);
			return $wpdb->insert_id;
		}

		return false;
	}

	/**
	 * Get submissions for a form
	 *
	 * @param int $form_id Form ID
	 * @param int $limit Limit results
	 * @param int $offset Offset results
	 * @return array Array of submission objects
	 */
	public static function get_form_submissions($form_id, $limit = 100, $offset = 0) {
		global $wpdb;

		$submissions_table = $wpdb->prefix . 'devlayer_submissions';

		$submissions = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$submissions_table} WHERE form_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
				intval($form_id),
				intval($limit),
				intval($offset)
			)
		);

		if ($submissions) {
			foreach ($submissions as $submission) {
				$submission->data = json_decode($submission->data, true);
			}
		}

		return $submissions;
	}

	/**
	 * Delete a submission
	 *
	 * @param int $submission_id Submission ID
	 * @return bool True on success, false on failure
	 */
	public static function delete_submission($submission_id) {
		global $wpdb;

		$submissions_table = $wpdb->prefix . 'devlayer_submissions';

		$result = $wpdb->delete(
			$submissions_table,
			array('id' => intval($submission_id)),
			array('%d')
		);

		return $result !== false;
	}

	/**
	 * Get client IP address (GDPR-aware)
	 *
	 * @return string Client IP address
	 */
	public static function get_client_ip() {
		$ip = '0.0.0.0';

		if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
			$ip = sanitize_text_field(wp_unslash($_SERVER['HTTP_CLIENT_IP']));
		} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
			// Handle multiple IPs in X-Forwarded-For header
			$ips = explode(',', sanitize_text_field(wp_unslash($_SERVER['HTTP_X_FORWARDED_FOR'])));
			$ip = trim($ips[0]);
		} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
			$ip = sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR']));
		}

		// Validate and sanitize IP
		if (!filter_var($ip, FILTER_VALIDATE_IP)) {
			$ip = '0.0.0.0';
		}

		return substr($ip, 0, 45);
	}
}
