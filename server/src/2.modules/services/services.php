<?php

conf_add('options', function($options) {
	_services::$options = $options;
});

class _services {
	public static $options;
}

/*
 * Returns value of the given option for the given service.
 */
function service_option( $name ) {
	if(isset(_services::$options[$name])) {
		return _services::$options[$name];
	}
	warning( "Unknown service option: '$name'" );
	return null;
}

function service_setting( $name, $default = null ) {
	return alt( service_settings::get_value( $name ), $default );
}



?>
