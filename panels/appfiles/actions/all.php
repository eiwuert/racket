<?php

set_actions_access( 'all' );

function service_login()
{
	$login = Vars::post( 'login' );
	$pass = Vars::post( 'password' );

	$acc_id = taxi_accounts::check( 'admin', $login, $pass );
	if( !$acc_id ) {
		return false;
	}

	taxi_logs::log_in( $acc_id, $_SERVER['REMOTE_ADDR'] );
	user::set( 'service', $acc_id, $login );
	redirect( url_t( "service-panel:" ) );
}

// TODO: separate service_login and admin_login.
function login()
{
	$login = Vars::post( "login" );
	$pass = Vars::post( "password" );

	if( $login == "admin" )
	{
		if( $pass == "nezayaFusu" ){
			user::set_type( 'admin' );
			redirect( url_t( "admin:" ) );
		}
	}
	return service_login();
}

function logout()
{
	$acc_id = user::get_id();
	user::set( null );
	if( !$acc_id ) return;

	taxi_logs::log_out( $acc_id, $_SERVER['REMOTE_ADDR'] );
}

?>
