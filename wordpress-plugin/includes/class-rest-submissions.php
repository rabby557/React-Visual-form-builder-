<?php
/**
 * REST API endpoints for form submissions
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST Submissions class
 */
class DevLayer_Form_REST_Submissions {
	const NAMESPACE = DEVLAYER_FORM_REST_NAMESPACE;
	const RESOURCE = '/submissions';

	/**
	 * Register REST routes
	 */
	public static function register_routes() {
		// List submissions for a form (admin only).
		register_rest_route(
			self::NAMESPACE,
			'/forms/(?P<form_id>\d+)' . self::RESOURCE,
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get_form_submissions' ),
					'permission_callback' => array( __CLASS__, 'check_admin_permission' ),
				),
			)
		);

		// Create submission (public endpoint).
		register_rest_route(
			self::NAMESPACE,
			self::RESOURCE,
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'create_submission' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Admin permission callback
	 *
	 * @return bool|WP_Error True if allowed, WP_Error otherwise.
	 */
	public static function check_admin_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 'unauthorized', 'Unauthorized', array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * Get submissions for a form
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error REST response or error.
	 */
	public static function get_form_submissions( $request ) {
		$form_id = intval( $request['form_id'] );

		// Validate form exists.
		$form = DevLayer_Form_Database::get_form( $form_id );
		if ( ! $form ) {
			return new WP_Error( 'not_found', 'Form not found', array( 'status' => 404 ) );
		}

		$limit  = isset( $request['limit'] ) ? intval( $request['limit'] ) : 100;
		$offset = isset( $request['offset'] ) ? intval( $request['offset'] ) : 0;

		// Limit to reasonable values.
		$limit  = min( $limit, 500 );
		$offset = max( $offset, 0 );

		$submissions = DevLayer_Form_Database::get_form_submissions( $form_id, $limit, $offset );

		return new WP_REST_Response(
			array(
				'success'    => true,
				'data'       => $submissions,
				'count'      => count( $submissions ),
				'pagination' => array(
					'limit'  => $limit,
					'offset' => $offset,
				),
			),
			200
		);
	}

	/**
	 * Create a new submission
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error REST response or error.
	 */
	public static function create_submission( $request ) {
		$body = json_decode( $request->get_body(), true );

		// Validate required fields.
		if ( empty( $body['form_id'] ) || empty( $body['data'] ) ) {
			return new WP_Error(
				'invalid_data',
				'Missing required fields: form_id, data',
				array( 'status' => 400 )
			);
		}

		$form_id = intval( $body['form_id'] );
		$data    = $body['data'];

		// Validate form exists and is not deleted.
		$form = DevLayer_Form_Database::get_form( $form_id );
		if ( ! $form ) {
			return new WP_Error( 'form_not_found', 'Form not found', array( 'status' => 404 ) );
		}

		// Validate submission data.
		if ( ! is_array( $data ) || empty( $data ) ) {
			return new WP_Error(
				'invalid_data',
				'Submission data must be a non-empty object',
				array( 'status' => 400 )
			);
		}

		$submission_id = DevLayer_Form_Database::create_submission( $form_id, $data );

		if ( ! $submission_id ) {
			return new WP_Error(
				'submission_failed',
				'Failed to create submission',
				array( 'status' => 500 )
			);
		}

		// Trigger hook for external handling (e.g., sending emails).
		do_action( 'devlayer_form_submission_created', $submission_id, $form_id, $data, $form );

		return new WP_REST_Response(
			array(
				'success'       => true,
				'submission_id' => $submission_id,
				'message'       => 'Submission received successfully',
			),
			201
		);
	}
}

/**
 * Hook to handle email notifications.
 */
add_action(
	'devlayer_form_submission_created',
	function( $submission_id, $form_id, $data, $form ) {
		// Check if email notifications are enabled.
		$enable_email = get_option( 'devlayer_form_enable_email_notifications', true );

		if ( ! $enable_email ) {
			return;
		}

		// Get admin email.
		$admin_email = get_option( 'admin_email' );

		// Build email subject and body.
		$subject = sprintf( '[Form Submission] %s', $form->title );

		$body = sprintf(
			"New form submission on %s:\n\nForm: %s\n\nSubmission Data:\n%s",
			get_site_url(),
			$form->title,
			devlayer_form_format_submission_data( $data )
		);

		// Apply filters to allow customization.
		$subject = apply_filters( 'devlayer_form_email_subject', $subject, $form_id, $data, $form );
		$body    = apply_filters( 'devlayer_form_email_body', $body, $form_id, $data, $form );
		$to      = apply_filters( 'devlayer_form_email_to', $admin_email, $form_id, $data, $form );

		$headers = array( 'Content-Type: text/plain; charset=UTF-8' );

		wp_mail( $to, $subject, $body, $headers );
	},
	10,
	4
);

/**
 * Format submission data for email
 *
 * @param array $data Submission data.
 * @return string Formatted submission data.
 */
function devlayer_form_format_submission_data( $data ) {
	$formatted = '';
	foreach ( $data as $key => $value ) {
		if ( is_array( $value ) ) {
			$value = json_encode( $value );
		}
		$formatted .= sprintf( "%s: %s\n", $key, $value );
	}
	return $formatted;
}
