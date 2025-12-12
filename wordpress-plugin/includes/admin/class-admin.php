<?php
/**
 * Admin functionality for DevLayer Form
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin class
 */
class DevLayer_Form_Admin {
	/**
	 * Initialize admin functionality
	 */
	public function initialize() {
		add_action( 'admin_menu', array( $this, 'register_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );
		add_action( 'admin_post_devlayer_form_license', array( $this, 'handle_license_update' ) );
	}

	/**
	 * Register admin menu
	 */
	public function register_admin_menu() {
		add_menu_page(
			esc_html__( 'DevLayer Form', 'devlayer-form' ),
			esc_html__( 'Forms', 'devlayer-form' ),
			'manage_options',
			'devlayer-form',
			array( $this, 'render_forms_page' ),
			'dashicons-document-alt',
			25
		);

		add_submenu_page(
			'devlayer-form',
			esc_html__( 'Form Builder', 'devlayer-form' ),
			esc_html__( 'All Forms', 'devlayer-form' ),
			'manage_options',
			'devlayer-form'
		);

		add_submenu_page(
			'devlayer-form',
			esc_html__( 'Settings', 'devlayer-form' ),
			esc_html__( 'Settings', 'devlayer-form' ),
			'manage_options',
			'devlayer-form-settings',
			array( $this, 'render_settings_page' )
		);

		add_submenu_page(
			'devlayer-form',
			esc_html__( 'License', 'devlayer-form' ),
			esc_html__( 'License', 'devlayer-form' ),
			'manage_options',
			'devlayer-form-license',
			array( $this, 'render_license_page' )
		);

		add_submenu_page(
			'devlayer-form',
			esc_html__( 'Documentation', 'devlayer-form' ),
			esc_html__( 'Documentation', 'devlayer-form' ),
			'manage_options',
			'devlayer-form-docs',
			array( $this, 'render_docs_page' )
		);
	}

	/**
	 * Handle license update
	 */
	public function handle_license_update() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Unauthorized' );
		}

		if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'devlayer_form_license_nonce' ) ) {
			wp_die( 'Nonce verification failed' );
		}

		$license_key = isset( $_POST['devlayer_form_license_key'] ) ? sanitize_text_field( wp_unslash( $_POST['devlayer_form_license_key'] ) ) : '';

		$container = devlayer_form_get_container();
		if ( $container ) {
			$licensing = $container->get( 'licensing' );
			if ( $licensing ) {
				$licensing->set_license_key( $license_key );
			}
		}

		wp_safe_redirect( admin_url( 'admin.php?page=devlayer-form-license&updated=1' ) );
		exit;
	}

	/**
	 * Render forms page
	 */
	public function render_forms_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'DevLayer Form Builder', 'devlayer-form' ); ?></h1>
			<p><?php esc_html_e( 'Form builder interface will load here.', 'devlayer-form' ); ?></p>
			<div id="devlayer-form-app"></div>
		</div>
		<?php
	}

	/**
	 * Render settings page
	 */
	public function render_settings_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'DevLayer Form Settings', 'devlayer-form' ); ?></h1>
			
			<form method="post" action="options.php">
				<?php
				settings_fields( 'devlayer_form_settings' );
				do_settings_sections( 'devlayer_form_settings' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}

	/**
	 * Render license page
	 */
	public function render_license_page() {
		$container = devlayer_form_get_container();
		$licensing = $container ? $container->get( 'licensing' ) : null;
		$is_premium = $licensing ? $licensing->is_premium_active() : false;
		$license_key = $licensing ? $licensing->get_license_key() : '';
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'DevLayer Form License', 'devlayer-form' ); ?></h1>
			
			<?php if ( isset( $_GET['updated'] ) ) : ?>
				<div class="notice notice-success inline">
					<p><?php esc_html_e( 'License updated successfully.', 'devlayer-form' ); ?></p>
				</div>
			<?php endif; ?>

			<div class="notice notice-info inline">
				<p>
					<?php
					if ( $is_premium ) {
						esc_html_e( 'Premium license is active.', 'devlayer-form' );
					} else {
						esc_html_e( 'You are using the free version of DevLayer Form.', 'devlayer-form' );
					}
					?>
				</p>
			</div>

			<form method="post" action="admin-post.php">
				<?php wp_nonce_field( 'devlayer_form_license_nonce' ); ?>
				<input type="hidden" name="action" value="devlayer_form_license" />
				<table class="form-table">
					<tr>
						<th scope="row">
							<label for="license_key"><?php esc_html_e( 'License Key', 'devlayer-form' ); ?></label>
						</th>
						<td>
							<input 
								type="password" 
								id="license_key" 
								name="devlayer_form_license_key" 
								value="<?php echo esc_attr( $license_key ); ?>" 
								class="regular-text"
							/>
							<p class="description">
								<?php esc_html_e( 'Enter your license key to activate premium features.', 'devlayer-form' ); ?>
							</p>
						</td>
					</tr>
				</table>
				<?php submit_button( esc_html__( 'Update License', 'devlayer-form' ) ); ?>
			</form>

			<?php if ( $is_premium && $licensing ) : ?>
				<h2><?php esc_html_e( 'Enabled Premium Features', 'devlayer-form' ); ?></h2>
				<ul style="list-style-type: disc; margin-left: 20px;">
					<?php foreach ( $licensing->get_enabled_features() as $feature ) : ?>
						<li><?php echo esc_html( ucfirst( str_replace( '_', ' ', $feature ) ) ); ?></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Render documentation page
	 */
	public function render_docs_page() {
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'DevLayer Form Documentation', 'devlayer-form' ); ?></h1>
			<p>
				<?php
				printf(
					wp_kses_post( __( 'For documentation, visit the <a href="%s" target="_blank">DevLayer documentation site</a>.', 'devlayer-form' ) ),
					esc_url( 'https://devlayer.com/docs/form' )
				);
				?>
			</p>
		</div>
		<?php
	}

	/**
	 * Enqueue admin scripts and styles
	 *
	 * @param string $hook Page hook.
	 */
	public function enqueue_admin_scripts( $hook ) {
		// Only load on DevLayer Form pages.
		if ( strpos( $hook, 'devlayer-form' ) === false ) {
			return;
		}

		// Enqueue admin styles.
		wp_enqueue_style(
			'devlayer-form-admin',
			DEVLAYER_FORM_PLUGIN_URL . 'assets/dist/admin-style.css',
			array(),
			DEVLAYER_FORM_VERSION
		);

		// Only enqueue React app on the main forms page.
		if ( 'toplevel_page_devlayer-form' === $hook ) {
			wp_enqueue_script(
				'devlayer-form-admin-app',
				DEVLAYER_FORM_PLUGIN_URL . 'assets/dist/devlayer-form-admin.js',
				array(),
				DEVLAYER_FORM_VERSION,
				true
			);

			// Localize script with API data.
			wp_localize_script(
				'devlayer-form-admin-app',
				'devlayerFormAdminConfig',
				array(
					'apiBase'   => rest_url( DEVLAYER_FORM_REST_NAMESPACE ),
					'nonce'     => wp_create_nonce( 'wp_rest' ),
					'isPremium' => devlayer_form_is_premium_active(),
					'siteUrl'   => get_site_url(),
				)
			);
		}
	}
}
