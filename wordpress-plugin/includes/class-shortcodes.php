<?php
/**
 * Shortcodes for embedding forms
 */

if (!defined('ABSPATH')) {
    exit;
}

class Form_Builder_Shortcodes {
    /**
     * Register shortcodes
     */
    public static function register() {
        add_shortcode('form-builder', array(__CLASS__, 'render_form'));
    }
    
    /**
     * Render form shortcode
     * Usage: [form-builder id="1"] or [form-builder slug="my-form"]
     */
    public static function render_form($atts) {
        $atts = shortcode_atts(array(
            'id' => '',
            'slug' => '',
            'class' => '',
        ), $atts, 'form-builder');
        
        // Get form either by ID or slug
        $form = null;
        
        if (!empty($atts['id'])) {
            $form = Form_Builder_Database::get_form(intval($atts['id']));
        } elseif (!empty($atts['slug'])) {
            $form = Form_Builder_Database::get_form_by_slug(sanitize_text_field($atts['slug']));
        }
        
        if (!$form) {
            if (current_user_can('manage_options')) {
                return '<div class="form-builder-error">Form not found. Please check the form ID or slug.</div>';
            }
            return '';
        }
        
        // Enqueue necessary assets
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
        
        // Localize script with form data
        wp_localize_script('form-builder-app', 'formBuilderConfig', array(
            'apiBase' => rest_url(FORM_BUILDER_REST_NAMESPACE),
            'formData' => $form,
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
        ));
        
        // Generate container ID
        $container_id = 'form-builder-' . $form->id;
        
        $html = sprintf(
            '<div id="%s" class="form-builder-container %s" data-form-id="%d" data-form-slug="%s"></div>',
            esc_attr($container_id),
            esc_attr($atts['class']),
            intval($form->id),
            esc_attr($form->slug)
        );
        
        return $html;
    }
}
