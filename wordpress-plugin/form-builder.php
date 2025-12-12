<?php
/**
 * Plugin Name: Form Builder
 * Description: REST API endpoints for form builder schema management and submissions
 * Version: 1.0.0
 * Author: Builder Team
 * License: GPL v2 or later
 * Text Domain: form-builder
 * Domain Path: /languages
 */

if (!defined('ABSPATH')) {
    exit;
}

define('FORM_BUILDER_VERSION', '1.0.0');
define('FORM_BUILDER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FORM_BUILDER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FORM_BUILDER_REST_NAMESPACE', 'form-builder/v1');

// Include required files
require_once FORM_BUILDER_PLUGIN_DIR . 'includes/class-database.php';
require_once FORM_BUILDER_PLUGIN_DIR . 'includes/class-rest-forms.php';
require_once FORM_BUILDER_PLUGIN_DIR . 'includes/class-rest-submissions.php';
require_once FORM_BUILDER_PLUGIN_DIR . 'includes/class-shortcodes.php';

// Activation hook
register_activation_hook(__FILE__, 'form_builder_activate');
function form_builder_activate() {
    Form_Builder_Database::create_tables();
    flush_rewrite_rules();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'form_builder_deactivate');
function form_builder_deactivate() {
    flush_rewrite_rules();
}

// Initialize plugin
add_action('plugins_loaded', 'form_builder_init');
function form_builder_init() {
    // Register REST routes
    Form_Builder_REST_Forms::register_routes();
    Form_Builder_REST_Submissions::register_routes();
    
    // Register shortcodes
    Form_Builder_Shortcodes::register();
    
    // Load scripts for embedding forms
    add_action('wp_enqueue_scripts', 'form_builder_enqueue_scripts');
}

function form_builder_enqueue_scripts() {
    // Only load on pages that have the [form-builder] shortcode
    if (!is_admin() && has_shortcode(get_post_field('post_content'), 'form-builder')) {
        wp_enqueue_style(
            'form-builder-styles',
            FORM_BUILDER_PLUGIN_URL . 'assets/dist/style.css',
            array(),
            FORM_BUILDER_VERSION
        );
        
        wp_enqueue_script(
            'form-builder-app',
            FORM_BUILDER_PLUGIN_URL . 'assets/dist/form-builder.js',
            array(),
            FORM_BUILDER_VERSION,
            true
        );
        
        // Localize script with API endpoint and settings
        wp_localize_script('form-builder-app', 'formBuilderConfig', array(
            'apiBase' => rest_url(FORM_BUILDER_REST_NAMESPACE),
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
        ));
    }
}
