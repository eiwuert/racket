<?php

/*
 * Dispatcher user type.
 */
define( 'T_DISPATCHER', 'dispatcher' );

function disp_error( $cid, $error )
{
	$m = new message( "result", array(
		"errstr" => $error
	));
	$bytes = write_message( $cid, $m );

	if( $error ) {
		warning( "dispatcher error: $error" );
	}
	return $bytes;
}

function disp_result( $cid, $ok )
{
	$err = $ok ? null : "unspecified error";
	return disp_error( $cid, $err );
}

function disp_get_driver_id( $msg, $user )
{
	$taxi_id = $msg->data( 'driver_id' );
	if( !$taxi_id ) {
		warning( "Missing driver_id" );
		return null;
	}
	return intval( $taxi_id );
}

add_cmdfunc(T_S2, 'dispatcher-cmd', 'disp_ws::dispatch');
$ns = 'disp_sessions::';
disp_ws::addfunc( 'open-session', $ns.'msg_open_session' );
disp_ws::addfunc( 'close-session', $ns.'msg_close_session' );
$NS = 'disp_proto_bans::';
disp_ws::addfunc( 'ban-taxi', $NS.'msg_ban_taxi' );
disp_ws::addfunc( 'unban-taxi', $NS.'msg_unban_taxi' );
$ns = 'disp_proto_chat::';
disp_ws::addfunc( 'send-chat-message', $ns.'msg_send_chat_message' );
disp_ws::addfunc( 'broadcast-chat', $ns.'msg_broadcast_chat' );
	
$NS = 'proto_dispatcher::';
disp_ws::addfunc( 'auth-dispatcher', $NS.'msg_auth_dispatcher' );
disp_ws::addfunc( 'send-text', $NS.'msg_send_text' );
$ns = 'proto_disp_imitations::';
disp_ws::addfunc( 'set-imitation-online', $ns.'msg_set_imitation_online' );

$NS = 'dispatcher_orders::';
disp_ws::addfunc( 'save-order', $NS.'msg_save_order' );
disp_ws::addfunc( 'send-order', $NS.'msg_send_order' );
disp_ws::addfunc( 'cancel-order', $NS.'msg_cancel_order' );

$NS = 'proto_dispatcher_queues::';
disp_ws::addfunc( 'put-into-queue', $NS.'msg_put_into_queue' );
disp_ws::addfunc( 'remove-from-queue', $NS.'msg_remove_from_queue' );
disp_ws::addfunc( 'restore-queue', $NS.'msg_restore_queue' );
disp_ws::addfunc( 'change-driver-group', $NS.'msg_change_driver_group' );
disp_ws::addfunc( 'suggest-queue', $NS.'msg_suggest_queue' );
disp_ws::addfunc( 'change-queue', $NS.'msg_change_queue' );
	
class disp_ws
{
	static $cmds = [];
	
	static function addfunc($cmdname, $func) {
		self::$cmds[$cmdname] = $func;
	}
	
	static function dispatch($msg) {
		var_dump($msg);
		$name = $msg->data('command');
		$data = $msg->data('data');
		$user = new conn_user(T_DISPATCHER, $msg->data('dispatcher_id'));
		$tmsg = new message($name, $data);
		self::process($tmsg, $user);
	}

	private static function process($msg, $user) {
		$cmdname = $msg->command;
		$func = self::$cmds[$cmdname];
		call_user_func($func, $msg, $user);
	}
}

function disp_send($disp_id, $cmd, $data = []) {
	disp_broadcast($cmd, $data, $disp_id);
}

function disp_broadcast($cmd, $data = [], $disp_id = 0)
{
	s2_send('dispatcher-send', [
		'cmd' => $cmd,
		'data' => $data,
		'dispatcher_id' => $disp_id
	]);
}

?>
