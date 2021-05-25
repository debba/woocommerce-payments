<?php
/**
 * Class WCPay_Multi_Currency_Currency_Switcher_Widget_Tests
 *
 * @package WooCommerce\Payments\Tests
 */

use WCPay\Multi_Currency\Currency;

/**
 * WCPay\Multi_Currency\Currency_Switcher_Widget unit tests.
 */
class WCPay_Multi_Currency_Currency_Switcher_Widget_Tests extends WP_UnitTestCase {
	/**
	 * Mock WCPay\Multi_Currency\Multi_Currency.
	 *
	 * @var WCPay\Multi_Currency\Multi_Currency|PHPUnit_Framework_MockObject_MockObject
	 */
	private $mock_multi_currency;

	/**
	 * WCPay\Multi_Currency\Currency_Switcher_Widget instance.
	 *
	 * @var WCPay\Multi_Currency\Currency_Switcher_Widget
	 */
	private $currency_switcher_widget;

	/**
	 * Pre-test setup
	 */
	public function setUp() {
		parent::setUp();

		$this->mock_multi_currency = $this->createMock( WCPay\Multi_Currency\Multi_Currency::class );
		$this->mock_multi_currency
			->method( 'get_enabled_currencies' )
			->willReturn(
				[
					new Currency( 'USD' ),
					new Currency( 'CAD', 1.2 ),
					new Currency( 'EUR', 0.8 ),
				]
			);

		$this->currency_switcher_widget = new WCPay\Multi_Currency\Currency_Switcher_Widget( $this->mock_multi_currency );
	}


	public function test_widget_renders_title_with_args() {
		$instance = [
			'title' => 'Test Title',
		];
		$this->render_widget( $instance );
		$this->expectOutputRegex( '/<h2>Test Title<\/h2>/' );
		$this->expectOutputRegex( '/<section>/' );
		$this->expectOutputRegex( '/<\/section>/' );
		$this->expectOutputRegex( '/aria-label="Test Title"/' );
	}

	public function test_widget_renders_enabled_currencies_with_symbol() {
		$this->render_widget();
		$this->expectOutputRegex( '/<option value="USD">&#36; USD<\/option>/' );
		$this->expectOutputRegex( '/<option value="CAD">&#36; CAD<\/option>/' );
		$this->expectOutputRegex( '/<option value="EUR">&euro; EUR<\/option>/' );
	}

	public function test_widget_renders_enabled_currencies_without_symbol() {
		$instance = [
			'symbol' => 0,
		];
		$this->render_widget( $instance );
		$this->expectOutputRegex( '/<option value="USD">USD<\/option>/' );
		$this->expectOutputRegex( '/<option value="CAD">CAD<\/option>/' );
		$this->expectOutputRegex( '/<option value="EUR">EUR<\/option>/' );
	}

	public function test_widget_renders_enabled_currencies_with_symbol_and_flag() {
		$instance = [
			'symbol' => 1,
			'flag'   => 1,
		];
		$this->render_widget( $instance );
		$this->expectOutputRegex( '/<option value="USD">🇺🇸 &#36; USD<\/option>/' );
		$this->expectOutputRegex( '/<option value="CAD">🇨🇦 &#36; CAD<\/option>/' );
		$this->expectOutputRegex( '/<option value="EUR">🇪🇺 &euro; EUR<\/option>/' );
	}

	public function test_widget_selects_selected_currency() {
		$this->mock_multi_currency->method( 'get_selected_currency' )->willReturn( new Currency( 'CAD' ) );
		$this->render_widget();
		$this->expectOutputRegex( '/<option value="USD">&#36; USD<\/option>/' );
		$this->expectOutputRegex( '/<option value="CAD" selected>&#36; CAD<\/option>/' );
		$this->expectOutputRegex( '/<option value="EUR">&euro; EUR<\/option>/' );
	}

	public function test_widget_submits_form_on_change() {
		$this->render_widget();
		$this->expectOutputRegex( '/onchange="this.form.submit\(\)"/' );
	}

	public function test_update_method() {
		$old_instance = [];
		$new_instance = [
			'title'  => "Title <br/> \n",
			'symbol' => 'on',
		];

		$result = $this->currency_switcher_widget->update( $new_instance, $old_instance );
		$this->assertEquals(
			[
				'title'  => 'Title',
				'symbol' => 1,
				'flag'   => 0,
			],
			$result
		);
	}

	public function test_form_output() {
		$instance = [
			'title'  => 'Custom title',
			'symbol' => 1,
			'flag'   => 0,
		];
		$this->currency_switcher_widget->form( $instance );
		$this->expectOutputRegex( '/name="widget-currency_switcher_widget\[\]\[title\]""/' );
		$this->expectOutputRegex( '/value="Custom title"/' );
		$this->expectOutputRegex( '/name="widget-currency_switcher_widget\[\]\[symbol\]".+checked/s' );
		$this->expectOutputRegex( '/name="widget-currency_switcher_widget\[\]\[flag\]"(?!.+checked).+\/>/s' );
	}

	/**
	 * Helper fuction to call widget method with default args.
	 *
	 * @param array $instance Saved values from database.
	 */
	private function render_widget( array $instance = [] ) {
		$this->currency_switcher_widget->widget(
			[
				'before_title'  => '<h2>',
				'after_title'   => '</h2>',
				'before_widget' => '<section>',
				'after_widget'  => '</section>',
			],
			$instance
		);
	}
}
