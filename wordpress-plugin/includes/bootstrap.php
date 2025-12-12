<?php
/**
 * Plugin bootstrap and initialization
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Initialize plugin on plugins_loaded hook.
add_action( 'plugins_loaded', 'devlayer_form_init' );

/**
 * Initialize the plugin.
 */
function devlayer_form_init() {
	// Load text domain for translations.
	load_plugin_textdomain(
		'devlayer-form',
		false,
		dirname( plugin_basename( DEVLAYER_FORM_PLUGIN_DIR . 'devlayer-form.php' ) ) . '/languages'
	);

	// Create and initialize service container.
	$container = new DevLayer_Form_Service_Container();

	// Store container in global for access throughout plugin.
	$GLOBALS['devlayer_form_container'] = $container;

	// Register REST routes.
	$container->get( 'rest_forms' )->register_routes();
	$container->get( 'rest_submissions' )->register_routes();

	// Register shortcodes.
	$container->get( 'shortcodes' )->register();

	// Initialize admin if in admin area.
	if ( is_admin() ) {
		$container->get( 'admin' )->initialize();
	}

	// Enqueue scripts for embeds.
	add_action( 'wp_enqueue_scripts', 'devlayer_form_enqueue_scripts' );
}

/**
 * Enqueue scripts for form embeds
 */
function devlayer_form_enqueue_scripts() {
	// Only load on pages that have the [devlayer-form] shortcode.
	if ( ! is_admin() && has_shortcode( get_post_field( 'post_content' ), 'devlayer-form' ) ) {
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

		// Localize script with API endpoint and settings.
		wp_localize_script(
			'devlayer-form-app',
			'devlayerFormConfig',
			array(
				'apiBase' => rest_url( DEVLAYER_FORM_REST_NAMESPACE ),
				'nonce'   => wp_create_nonce( 'wp_rest' ),
				'siteUrl' => get_site_url(),
			)
		);
	}
}

/**
 * Get the service container instance
 *
 * @return DevLayer_Form_Service_Container|null Service container or null.
 */
function devlayer_form_get_container() {
	return isset( $GLOBALS['devlayer_form_container'] ) ? $GLOBALS['devlayer_form_container'] : null;
}
