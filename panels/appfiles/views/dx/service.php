<?php

$type = user::get_type();
if( $type != 'service' ) {
	error_forbidden();
}

$list = array(
	'login-taken'
);

dx::dispatch( argv(1), $list );

function q_login_taken()
{
	$login = vars::get( 'login' );
	$type = vars::get( 'type' );
	return DB::exists( 'taxi_accounts', array(
		'login' => $login,
		'type' => $type
	));
}

?>
