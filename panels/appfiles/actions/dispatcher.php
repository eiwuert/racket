<?php

set_actions_access( 'dispatcher' );

function send_dispatcher_message()
{
	$dispatcher_id = user::get_id();
	if( !$dispatcher_id ) {
		return false;
	}

	$cars = Vars::post( 'cars' );
	$text = Vars::post( 'message' );

	if( !is_array( $cars ) || !$text ) {
		return false;
	}

	$client = new dispatcher_client();
	$addr = setting( 'taxi_server_addr' );
	$ok = @$client->connect( $addr );
	if( !$ok ) {
		return "Не удалось соединиться с сервером.";
	}
	if( !$client->login( $dispatcher_id ) ) {
		return "Не удалось авторизоваться на сервере.";
	}

	foreach( $cars as $taxi_id ) {
		$client->send_text( $taxi_id, $text );
	}
	$client->disconnect();
}

function save_customer()
{
	$id = Vars::post( 'customer_id' );
	if( !$id ) return false;

	$customer = new customer( $id );
	$customer->name( Vars::post( 'name' ) );
	$customer->comments( Vars::post( 'comments' ) );
	$customer->blacklist( alt( Vars::post( 'blacklist' ), '0' ) );
	$customer->save();
}

?>
