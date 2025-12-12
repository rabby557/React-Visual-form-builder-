<?php
/**
 * Service Container for dependency injection
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Service Container class
 */
class DevLayer_Form_Service_Container {
	/**
	 * Container services
	 *
	 * @var array
	 */
	private $services = array();

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->register_services();
	}

	/**
	 * Register all services
	 */
	private function register_services() {
		// Register database service.
		$this->services['database'] = new DevLayer_Form_Database();

		// Register REST forms service.
		$this->services['rest_forms'] = new DevLayer_Form_REST_Forms();

		// Register REST submissions service.
		$this->services['rest_submissions'] = new DevLayer_Form_REST_Submissions();

		// Register shortcodes service.
		$this->services['shortcodes'] = new DevLayer_Form_Shortcodes();

		// Register admin service.
		$this->services['admin'] = new DevLayer_Form_Admin();

		// Register licensing service.
		$this->services['licensing'] = new DevLayer_Form_Licensing();
	}

	/**
	 * Get a service from the container
	 *
	 * @param string $name Service name.
	 * @return mixed Service instance.
	 */
	public function get( $name ) {
		return isset( $this->services[ $name ] ) ? $this->services[ $name ] : null;
	}

	/**
	 * Check if a service exists
	 *
	 * @param string $name Service name.
	 * @return bool True if service exists.
	 */
	public function has( $name ) {
		return isset( $this->services[ $name ] );
	}
}
