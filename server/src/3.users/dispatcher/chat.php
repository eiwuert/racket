<?php

init( function() {
	$ns = 'disp_proto_chat::';
	listen_events( EV_CHAT_MESSAGE, $ns.'ev_chat_message' );
});

class disp_proto_chat
{
	static function ev_chat_message( $event )
	{
		if( !self::pass( $event ) ) {
			return;
		}

		$to = $event->data['to'];
		$to = $to ? intval( $to ) : null;

		disp_broadcast( 'chat-message', array(
			'id' => intval( $event->data['id'] ),
			'from' => intval( $event->data['from'] ),
			'to' => $to,
			'to_type' => $event->data['to_type'],
			'text' => $event->data['text'],
			'utc' => intval( $event->data['time'] )
		));
	}

	private static function pass( $event )
	{
		if( $event->data['to_type'] == "dispatcher" ) {
			return true;
		}

		$from = $event->data['from'];
		$acc = new taxi_account( $from, 'type' );
		if( $acc->type() == 'dispatcher' ) {
			return true;
		}

		$to = $event->data['to'];
		if( $to ) {
			$acc = new taxi_account( $to, 'type' );
			if( $acc->type() == 'dispatcher' ) {
				return true;
			}
		}

		return false;
	}

	static function msg_send_chat_message( $msg, $user )
	{
		$to = $msg->data( 'to' );
		$text = $msg->data( 'text' );
		$to_type = $msg->data( 'to_type' );

		if( $to ) {
			$ok = chat::send( $user->id, $to, $text );
		} else {
			$ok = chat::broadcast( $user->id, $to_type, $text );
		}
		return disp_result( $msg->cid, $ok );
	}

	static function msg_broadcast_chat( $msg, $user )
	{
		$to = $msg->data( 'to' );
		$text = $msg->data( 'text' );

		if( !is_array( $to ) ) {
			return disp_error( $msg->cid, "The `to` field must contain an array" );
		}

		foreach( $to as $driver_id ) {
			/*
			 * The chat::send function checks service identifiers itself.
			 */
			chat::send( $user->id, $driver_id, $text );
		}

		return disp_result( $msg->cid, true );
	}
}

?>
