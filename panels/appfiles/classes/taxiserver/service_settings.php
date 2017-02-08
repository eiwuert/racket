<?php

class service_settings
{
	static $defaults = array(
		'queue_dialogs' => '0',
		'queue_dialog_time' => '30',
		'restore_queues' => '1',
		'driver_orders' => '0',
		'mark_customers' => '0',
		'accept_timeout' => '10',
		'queue_drivers' => '2',
		'search_radius' => '3000',
		'search_number' => '1',
		'pool_enabled_queues' => '1',
		'pool_enabled_city' => '1',
		'publish_duration' => '20',
		'default_city' => 'Минск',
		'phrases_driver' => '',
		'phrases_dispatcher' => ''
	);

	static function get_settings()
	{
		$a = DB::getRecords( "SELECT name, value
			FROM taxi_service_settings" );
		$s = array_column( $a, 'value', 'name' );
		foreach( self::$defaults as $k => $v ) {
			if( !array_key_exists( $k, $s ) ) {
				$s[$k] = $v;
			}
		}
		return $s;
	}

	static function get_value( $key )
	{
		$val = DB::getValue( "SELECT value
			FROM taxi_service_settings
			WHERE name = '%s'", $key
		);
		if( $val === null && isset( self::$defaults[$key] ) ) {
			$val = self::$defaults[$key];
		}
		return $val;
	}

	static function set_value( $key, $value )
	{
		DB::exec( "START TRANSACTION" );
		DB::exec( "DELETE FROM taxi_service_settings
			WHERE name = '%s'", $key );
		DB::insertRecord( 'taxi_service_settings', array(
			'name' => $key,
			'value' => $value
		));
		DB::exec( "COMMIT" );
	}

	static function save( $settings )
	{
		DB::exec( "START TRANSACTION" );
		DB::exec( "DELETE FROM taxi_service_settings" );
		foreach( $settings as $k => $v ) {
			DB::insertRecord( 'taxi_service_settings', array(
				'name' => $k,
				'value' => $v
			));
		}
		DB::exec( "COMMIT" );
	}

	static function config( $name )
	{
		trigger_error("service_settings::config is a stub");
	}
}

?>
