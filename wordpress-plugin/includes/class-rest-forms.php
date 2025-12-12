<?php
/**
 * REST API endpoints for form management
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST Forms class
 */
class DevLayer_Form_REST_Forms {
	const NAMESPACE = DEVLAYER_FORM_REST_NAMESPACE;
	const RESOURCE = '/forms';

	/**
	 * Register REST routes
	 */
	public static function register_routes() {
		// List all forms.
		register_rest_route(
			self::NAMESPACE,
			self::RESOURCE,
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get_forms' ),
					'permission_callback' => array( __CLASS__, 'check_permission' ),
				),
				// Create form.
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'create_form' ),
					'permission_callback' => array( __CLASS__, 'check_permission' ),
				),
			)
		);

		// Get, update, delete single form.
		register_rest_route(
			self::NAMESPACE,
			self::RESOURCE . '/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get_form' ),
					'permission_callback' => array( __CLASS__, 'check_permission' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'update_form' ),
					'permission_callback' => array( __CLASS__, 'check_permission' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( __CLASS__, 'delete_form' ),
					'permission_callback' => array( __CLASS__, 'check_permission' ),
				),
			)
		);

		// Get form by slug (public endpoint for preview).
		register_rest_route(
			self::NAMESPACE,
			'/forms/slug/(?P<slug>[a-zA-Z0-9_-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'get_form_by_slug' ),
					'permission_callback' => '__return_true',
				),
			)
		);
	}

	/**
	 * Permission callback
	 *
	 * @return bool|WP_Error True if allowed, WP_Error otherwise.
	 */
	public static function check_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error( 'unauthorized', 'Unauthorized', array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * Get all forms
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response REST response.
	 */
	public static function get_forms( $request ) {
		$forms = DevLayer_Form_Database::get_all_forms();

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $forms,
				'count'   => count( $forms ),
			),
			200
		);
	}

	/**
	 * Get single form by ID
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error REST response or error.
	 */
	public static function get_form( $request ) {
		$form_id = intval( $request['id'] );

		$form = DevLayer_Form_Database::get_form( $form_id );

		if ( ! $form ) {
			return new WP_Error( 'not_found', 'Form not found', array( 'status' => 404 ) );
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $form,
			),
			200
		);
	}

	/**
	 * Get form by slug (public endpoint)
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error REST response or error.
	 */
	public static function get_form_by_slug( $request ) {
		$slug = sanitize_text_field( $request['slug'] );

		$form = DevLayer_Form_Database::get_form_by_slug( $slug );

		if ( ! $form ) {
			return new WP_Error( 'not_found', 'Form not found', array( 'status' => 404 ) );
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $form,
			),
			200
		);
	}

	/**
	 * Create a new form
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error REST response or error.
	 */
	public static function create_form( $request ) {
		$body = json_decode( $request->get_body(), true );

		// Validate required fields.
		if ( empty( $body['title'] ) || empty( $body['slug'] ) || empty( $body['schema'] ) ) {
			return new WP_Error(
				'invalid_data',
				'Missing required fields: title, slug, schema',
				array( 'status' => 400 )
			);
		}

		$title  = sanitize_text_field( $body['title'] );
		$slug   = sanitize_title( $body['slug'] );
		$schema = $body['schema'];

		// Validate schema structure.
		if ( ! is_array( $schema ) ) {
			return new WP_Error(
				'invalid_schema',
				'Schema must be a valid object',
				array( 'status' => 400 )
			);
		}

		$form_id = DevLayer_Form_Database::create_form( $title, $slug, $schema );

		if ( ! $form_id ) {
			return new WP_Error(
				'creation_failed',
				'Failed to create form',
				array( 'status' => 500 )
			);
		}

		$form = DevLayer_Form_Database::get_form( $form_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $form,
				'message' => 'Form created successfully',
			),
			201
		);
	}

	/**
	 * Update a form
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error REST response or error.
	 */
	public static function update_form( $request ) {
		$form_id = intval( $request['id'] );
		$body    = json_decode( $request->get_body(), true );

		// Check if form exists.
		$form = DevLayer_Form_Database::get_form( $form_id );
		if ( ! $form ) {
			return new WP_Error( 'not_found', 'Form not found', array( 'status' => 404 ) );
		}

		// Validate required fields.
		if ( empty( $body['title'] ) || empty( $body['schema'] ) ) {
			return new WP_Error(
				'invalid_data',
				'Missing required fields: title, schema',
				array( 'status' => 400 )
			);
		}

		$title  = sanitize_text_field( $body['title'] );
		$schema = $body['schema'];

		// Validate schema structure.
		if ( ! is_array( $schema ) ) {
			return new WP_Error(
				'invalid_schema',
				'Schema must be a valid object',
				array( 'status' => 400 )
			);
		}

		$success = DevLayer_Form_Database::update_form( $form_id, $title, $schema );

		if ( ! $success ) {
			return new WP_Error(
				'update_failed',
				'Failed to update form',
				array( 'status' => 500 )
			);
		}

		$form = DevLayer_Form_Database::get_form( $form_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $form,
				'message' => 'Form updated successfully',
			),
			200
		);
	}

	/**
	 * Delete a form
	 *
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response|WP_Error REST response or error.
	 */
	public static function delete_form( $request ) {
		$form_id = intval( $request['id'] );

		// Check if form exists.
		$form = DevLayer_Form_Database::get_form( $form_id );
		if ( ! $form ) {
			return new WP_Error( 'not_found', 'Form not found', array( 'status' => 404 ) );
		}

		$success = DevLayer_Form_Database::delete_form( $form_id );

		if ( ! $success ) {
			return new WP_Error(
				'delete_failed',
				'Failed to delete form',
				array( 'status' => 500 )
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => 'Form deleted successfully',
			),
			200
		);
	}
}
