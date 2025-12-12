<?php
/**
 * Licensing and premium feature management
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Licensing class
 */
class DevLayer_Form_Licensing {
	/**
	 * Get license key
	 *
	 * @return string|false License key or false if not set.
	 */
	public function get_license_key() {
		return get_option( 'devlayer_form_license_key', false );
	}

	/**
	 * Set license key
	 *
	 * @param string $key License key.
	 * @return bool True if updated.
	 */
	public function set_license_key( $key ) {
		return update_option( 'devlayer_form_license_key', sanitize_text_field( $key ) );
	}

	/**
	 * Check if premium is active
	 *
	 * @return bool True if premium is active and valid.
	 */
	public function is_premium_active() {
		$license_key = $this->get_license_key();

		if ( ! $license_key ) {
			return false;
		}

		// Check if license is valid (could be extended with remote validation).
		return apply_filters( 'devlayer_form_validate_license', true, $license_key );
	}

	/**
	 * Get premium status
	 *
	 * @return array Premium status data.
	 */
	public function get_premium_status() {
		return array(
			'is_active'   => $this->is_premium_active(),
			'license_key' => $this->get_license_key() ? '***hidden***' : '',
			'features'    => $this->get_enabled_features(),
		);
	}

	/**
	 * Get enabled premium features
	 *
	 * @return array List of enabled features.
	 */
	public function get_enabled_features() {
		if ( ! $this->is_premium_active() ) {
			return array();
		}

		return apply_filters(
			'devlayer_form_premium_features',
			array(
				'advanced_analytics',
				'custom_emails',
				'conditional_logic',
				'payment_integration',
				'api_access',
			)
		);
	}

	/**
	 * Check if a specific feature is enabled
	 *
	 * @param string $feature Feature name.
	 * @return bool True if feature is enabled.
	 */
	public function is_feature_enabled( $feature ) {
		if ( ! $this->is_premium_active() ) {
			return false;
		}

		$enabled_features = $this->get_enabled_features();
		return in_array( $feature, $enabled_features, true );
	}
}

/**
 * Global helper function: check if premium is active
 *
 * @return bool True if premium is active.
 */
function devlayer_form_is_premium_active() {
	$container = devlayer_form_get_container();
	if ( ! $container ) {
		return false;
	}

	$licensing = $container->get( 'licensing' );
	return $licensing ? $licensing->is_premium_active() : false;
}

/**
 * Global helper function: check if a feature is enabled
 *
 * @param string $feature Feature name.
 * @return bool True if feature is enabled.
 */
function devlayer_form_is_feature_enabled( $feature ) {
	$container = devlayer_form_get_container();
	if ( ! $container ) {
		return false;
	}

	$licensing = $container->get( 'licensing' );
	return $licensing ? $licensing->is_feature_enabled( $feature ) : false;
}
