<?php
/**
 * Database management for forms and submissions
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Database class
 */
class DevLayer_Form_Database {
	/**
	 * Create database tables for forms and submissions
	 */
	public static function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		// Forms table.
		$forms_table = $wpdb->prefix . 'devlayer_form_forms';
		$forms_sql   = "CREATE TABLE IF NOT EXISTS $forms_table (
			id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			title VARCHAR(255) NOT NULL,
			slug VARCHAR(255) UNIQUE NOT NULL,
			schema LONGTEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			deleted_at DATETIME NULL,
			PRIMARY KEY (id),
			KEY slug_index (slug),
			KEY created_at_index (created_at)
		) $charset_collate;";

		// Submissions table.
		$submissions_table = $wpdb->prefix . 'devlayer_form_submissions';
		$submissions_sql   = "CREATE TABLE IF NOT EXISTS $submissions_table (
			id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
			form_id BIGINT(20) UNSIGNED NOT NULL,
			data LONGTEXT NOT NULL,
			ip_address VARCHAR(45),
			user_agent VARCHAR(255),
			user_id BIGINT(20) UNSIGNED,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			KEY form_id_index (form_id),
			KEY created_at_index (created_at),
			FOREIGN KEY (form_id) REFERENCES $forms_table(id) ON DELETE CASCADE
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $forms_sql );
		dbDelta( $submissions_sql );
	}

	/**
	 * Get a form by ID
	 *
	 * @param int $form_id Form ID.
	 * @return object|null Form object or null.
	 */
	public static function get_form( $form_id ) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_form_forms';

		$form = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM $forms_table WHERE id = %d AND deleted_at IS NULL LIMIT 1",
				$form_id
			)
		);

		if ( $form ) {
			$form->schema = json_decode( $form->schema, true );
		}

		return $form;
	}

	/**
	 * Get a form by slug
	 *
	 * @param string $slug Form slug.
	 * @return object|null Form object or null.
	 */
	public static function get_form_by_slug( $slug ) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_form_forms';

		$form = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM $forms_table WHERE slug = %s AND deleted_at IS NULL LIMIT 1",
				$slug
			)
		);

		if ( $form ) {
			$form->schema = json_decode( $form->schema, true );
		}

		return $form;
	}

	/**
	 * Get all forms
	 *
	 * @return array Array of form objects.
	 */
	public static function get_all_forms() {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_form_forms';

		$forms = $wpdb->get_results(
			"SELECT * FROM $forms_table WHERE deleted_at IS NULL ORDER BY created_at DESC"
		);

		if ( $forms ) {
			foreach ( $forms as $form ) {
				$form->schema = json_decode( $form->schema, true );
			}
		}

		return $forms;
	}

	/**
	 * Create a new form
	 *
	 * @param string $title Form title.
	 * @param string $slug Form slug.
	 * @param array  $schema Form schema.
	 * @return int|false Form ID or false on failure.
	 */
	public static function create_form( $title, $slug, $schema ) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_form_forms';

		$result = $wpdb->insert(
			$forms_table,
			array(
				'title'  => $title,
				'slug'   => $slug,
				'schema' => json_encode( $schema ),
			),
			array( '%s', '%s', '%s' )
		);

		if ( $result ) {
			return $wpdb->insert_id;
		}

		return false;
	}

	/**
	 * Update a form
	 *
	 * @param int   $form_id Form ID.
	 * @param string $title Form title.
	 * @param array  $schema Form schema.
	 * @return bool True on success, false on failure.
	 */
	public static function update_form( $form_id, $title, $schema ) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_form_forms';

		$result = $wpdb->update(
			$forms_table,
			array(
				'title'  => $title,
				'schema' => json_encode( $schema ),
			),
			array( 'id' => $form_id ),
			array( '%s', '%s' ),
			array( '%d' )
		);

		return $result !== false;
	}

	/**
	 * Delete a form (soft delete)
	 *
	 * @param int $form_id Form ID.
	 * @return bool True on success, false on failure.
	 */
	public static function delete_form( $form_id ) {
		global $wpdb;

		$forms_table = $wpdb->prefix . 'devlayer_form_forms';

		$result = $wpdb->update(
			$forms_table,
			array( 'deleted_at' => current_time( 'mysql' ) ),
			array( 'id' => $form_id ),
			array( '%s' ),
			array( '%d' )
		);

		return $result !== false;
	}

	/**
	 * Create a submission
	 *
	 * @param int   $form_id Form ID.
	 * @param array $data Submission data.
	 * @return int|false Submission ID or false on failure.
	 */
	public static function create_submission( $form_id, $data ) {
		global $wpdb;

		$submissions_table = $wpdb->prefix . 'devlayer_form_submissions';

		$user_id = get_current_user_id();
		$user_id = $user_id ? $user_id : null;

		$result = $wpdb->insert(
			$submissions_table,
			array(
				'form_id'    => $form_id,
				'data'       => json_encode( $data ),
				'ip_address' => self::get_client_ip(),
				'user_agent' => isset( $_SERVER['HTTP_USER_AGENT'] ) ? substr( sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ), 0, 255 ) : '',
				'user_id'    => $user_id,
			),
			array( '%d', '%s', '%s', '%s', '%d' )
		);

		if ( $result ) {
			return $wpdb->insert_id;
		}

		return false;
	}

	/**
	 * Get submissions for a form
	 *
	 * @param int $form_id Form ID.
	 * @param int $limit Number of submissions to retrieve.
	 * @param int $offset Offset for pagination.
	 * @return array Array of submission objects.
	 */
	public static function get_form_submissions( $form_id, $limit = 100, $offset = 0 ) {
		global $wpdb;

		$submissions_table = $wpdb->prefix . 'devlayer_form_submissions';

		$submissions = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM $submissions_table WHERE form_id = %d ORDER BY created_at DESC LIMIT %d OFFSET %d",
				$form_id,
				$limit,
				$offset
			)
		);

		if ( $submissions ) {
			foreach ( $submissions as $submission ) {
				$submission->data = json_decode( $submission->data, true );
			}
		}

		return $submissions;
	}

	/**
	 * Get client IP address
	 *
	 * @return string Client IP address.
	 */
	public static function get_client_ip() {
		if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
			$ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_CLIENT_IP'] ) );
		} elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
			$ip = sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) );
		} else {
			$ip = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
		}

		// Validate and sanitize IP.
		if ( ! filter_var( $ip, FILTER_VALIDATE_IP ) ) {
			$ip = '0.0.0.0';
		}

		return substr( $ip, 0, 45 );
	}
}
