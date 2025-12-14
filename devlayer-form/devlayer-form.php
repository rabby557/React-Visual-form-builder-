<?php
/**
 * Plugin Name: DevLayer Form
 * Plugin URI: https://devlayer.io
 * Description: Form management and submission handling for DevLayer
 * Version: 1.0.0
 * Author: DevLayer Team
 * Author URI: https://devlayer.io
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: devlayer-form
 * Domain Path: /languages
 * Requires at least: 5.9
 * Requires PHP: 7.4
 */

if (!defined('ABSPATH')) {
	exit;
}

// Plugin constants
define('DEVLAYER_FORM_VERSION', '1.0.0');
define('DEVLAYER_FORM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DEVLAYER_FORM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DEVLAYER_FORM_REST_NAMESPACE', 'devlayer-form/v1');

// Include required files
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/class-database.php';
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/class-forms.php';
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/class-fields.php';
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/class-submissions.php';
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/class-rest.php';
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/class-admin.php';
require_once DEVLAYER_FORM_PLUGIN_DIR . 'includes/class-shortcodes.php';

// Activation hook
register_activation_hook(__FILE__, array('DevLayer_Form_Database', 'activate'));

// Deactivation hook
register_deactivation_hook(__FILE__, array('DevLayer_Form_Database', 'deactivate'));

// Uninstall hook
register_uninstall_hook(__FILE__, array('DevLayer_Form_Database', 'uninstall'));

// Initialize plugin
add_action('plugins_loaded', array('DevLayer_Form_Plugin', 'init'), 10);

/**
 * Main plugin class
 */
class DevLayer_Form_Plugin {
	/**
	 * Initialize the plugin
	 */
	public static function init() {
		// Register REST routes
		DevLayer_Form_REST::register_routes();

		// Register shortcodes
		DevLayer_Form_Shortcodes::register();

		// Enqueue scripts and styles
		add_action('wp_enqueue_scripts', array(__CLASS__, 'enqueue_scripts'));
		add_action('admin_enqueue_scripts', array(__CLASS__, 'enqueue_admin_scripts'));
	}

	/**
	 * Enqueue frontend scripts and styles
	 */
	public static function enqueue_scripts() {
		wp_enqueue_style(
			'devlayer-form-frontend',
			DEVLAYER_FORM_PLUGIN_URL . 'assets/css/frontend.css',
			array(),
			DEVLAYER_FORM_VERSION
		);

		wp_enqueue_script(
			'devlayer-form-frontend',
			DEVLAYER_FORM_PLUGIN_URL . 'assets/js/frontend.js',
			array(),
			DEVLAYER_FORM_VERSION,
			true
		);

		// Localize script
		wp_localize_script('devlayer-form-frontend', 'devlayerFormConfig', array(
			'apiBase' => rest_url(DEVLAYER_FORM_REST_NAMESPACE),
			'nonce' => wp_create_nonce('wp_rest'),
			'siteUrl' => get_site_url(),
		));
	}

	/**
	 * Enqueue admin scripts and styles
	 */
	public static function enqueue_admin_scripts() {
		wp_enqueue_style(
			'devlayer-form-admin',
			DEVLAYER_FORM_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			DEVLAYER_FORM_VERSION
		);

		wp_enqueue_script(
			'devlayer-form-admin',
			DEVLAYER_FORM_PLUGIN_URL . 'assets/js/admin.js',
			array(),
			DEVLAYER_FORM_VERSION,
			true
		);

		// Localize admin script
		wp_localize_script('devlayer-form-admin', 'devlayerFormAdmin', array(
			'apiBase' => rest_url(DEVLAYER_FORM_REST_NAMESPACE),
			'nonce' => wp_create_nonce('wp_rest'),
		));
	}
}
