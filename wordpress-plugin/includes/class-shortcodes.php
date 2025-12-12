<?php
/**
 * Shortcodes for embedding forms
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shortcodes class
 */
class DevLayer_Form_Shortcodes {
	/**
	 * Register shortcodes
	 */
	public static function register() {
		add_shortcode( 'devlayer-form', array( __CLASS__, 'render_form' ) );
	}

	/**
	 * Render form shortcode
	 * Usage: [devlayer-form id="1"] or [devlayer-form slug="my-form"]
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string HTML output.
	 */
	public static function render_form( $atts ) {
		$atts = shortcode_atts(
			array(
				'id'    => '',
				'slug'  => '',
				'class' => '',
			),
			$atts,
			'devlayer-form'
		);

		// Get form either by ID or slug.
		$form = null;

		if ( ! empty( $atts['id'] ) ) {
			$form = DevLayer_Form_Database::get_form( intval( $atts['id'] ) );
		} elseif ( ! empty( $atts['slug'] ) ) {
			$form = DevLayer_Form_Database::get_form_by_slug( sanitize_text_field( $atts['slug'] ) );
		}

		if ( ! $form ) {
			if ( current_user_can( 'manage_options' ) ) {
				return '<div class="devlayer-form-error">Form not found. Please check the form ID or slug.</div>';
			}
			return '';
		}

		// Enqueue necessary assets.
		wp_enqueue_style(
			'devlayer-form-styles',
			DEVLAYER_FORM_PLUGIN_URL . 'assets/dist/style.css',
			array(),
			DEVLAYER_FORM_VERSION
		);

		wp_enqueue_script(
			'devlayer-form-app',
			DEVLAYER_FORM_PLUGIN_URL . 'assets/dist/devlayer-form.js',
			array(),
			DEVLAYER_FORM_VERSION,
			true
		);

		// Localize script with form data.
		wp_localize_script(
			'devlayer-form-app',
			'devlayerFormConfig',
			array(
				'apiBase' => rest_url( DEVLAYER_FORM_REST_NAMESPACE ),
				'formData' => $form,
				'nonce'   => wp_create_nonce( 'wp_rest' ),
				'siteUrl' => get_site_url(),
			)
		);

		// Generate container ID.
		$container_id = 'devlayer-form-' . $form->id;

		$html = sprintf(
			'<div id="%s" class="devlayer-form-container %s" data-form-id="%d" data-form-slug="%s"></div>',
			esc_attr( $container_id ),
			esc_attr( $atts['class'] ),
			intval( $form->id ),
			esc_attr( $form->slug )
		);

		return $html;
	}
}
