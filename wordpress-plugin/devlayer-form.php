<?php
/**
 * Plugin Name: DevLayer Form
 * Description: Powerful form builder with REST API endpoints for schema management and submissions
 * Version: 1.0.0
 * Author: DevLayer
 * License: GPL v2 or later
 * Text Domain: devlayer-form
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'DEVLAYER_FORM_VERSION', '1.0.0' );
define( 'DEVLAYER_FORM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DEVLAYER_FORM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'DEVLAYER_FORM_REST_NAMESPACE', 'devlayer-form/v1' );

// Autoloader for plugin classes.
spl_autoload_register(
	function ( $class ) {
		// Only load classes in the DevLayer_Form namespace.
		if ( strpos( $class, 'DevLayer_Form' ) !== 0 ) {
			return;
		}

		// Remove the namespace prefix and convert to file path.
		$relative = substr( $class, 12 ); // Remove 'DevLayer_Form' prefix.
		$file      = strtolower( str_replace( '_', '-', $relative ) );
		$filepath  = DEVLAYER_FORM_PLUGIN_DIR . 'includes/' . $file . '.php';

		if ( file_exists( $filepath ) ) {
			require_once $filepath;
		}
	}
);

// Load the plugin bootstrap.
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/bootstrap.php';

// Register activation hook.
register_activation_hook( __FILE__, 'devlayer_form_activate' );

/**
 * Plugin activation hook.
 */
function devlayer_form_activate() {
	DevLayer_Form_Database::create_tables();

	// Set default options.
	if ( ! get_option( 'devlayer_form_version' ) ) {
		add_option( 'devlayer_form_version', DEVLAYER_FORM_VERSION );
	}

	if ( ! get_option( 'devlayer_form_enable_email_notifications' ) ) {
		add_option( 'devlayer_form_enable_email_notifications', true );
	}

	// Flush rewrite rules.
	flush_rewrite_rules();
}

// Register deactivation hook.
register_deactivation_hook( __FILE__, 'devlayer_form_deactivate' );

/**
 * Plugin deactivation hook.
 */
function devlayer_form_deactivate() {
	// Flush rewrite rules.
	flush_rewrite_rules();
}
