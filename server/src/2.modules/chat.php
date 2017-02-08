<?php

define( 'EV_CHAT_MESSAGE', 'chat-message-event' );
register_event_type( EV_CHAT_MESSAGE );

class chat
{
	static function phrases( $type )
	{
		$s = service_setting( 'phrases_driver' );
		if( !$s ) $s = '';
		return array_map( 'trim', explode( "\n", $s ) );
	}

	static function send( $from, $to, $text ) {
		return self::add_msg( $from, $to, null, $text );
	}

	static function broadcast( $from, $to_type, $text ) {
		return self::add_msg( $from, null, $to_type, $text );
	}

	private static function add_msg( $from, $to, $to_type, $text )
	{
		if( !$from || !$text ) {
			warning( "Illegal arguments in add_msg" );
			return false;
		}
		if( $to && $to_type ) {
			warning( "Illegal arguments in add_msg: to=$to, to_type=$to" );
			return false;
		}

		$acc1 = new taxi_account( $from, 'type, call_id, deleted' );
		$acc2 = null;

		if( $acc1->deleted() || strlen( $acc1->call_id() ) == 0 ) {
			warning( "Illegal message from account #$from" );
			return false;
		}

		/*
		 * If this is a direct message, check that both accounts exist
		 */
		if( $to )
		{
			$acc2 = new taxi_account( $to, 'type, deleted' );
			if( $acc2->deleted() ) {
				warning( "Illegal chat message from #$from to #$to" );
				return false;
			}
		}
		/*
		 * If this is a broadcast check that the addressee type is valid.
		 */
		else
		{
			if( $to_type != "dispatcher" && $to_type != "driver" ) {
				warning( "Illegal chat broadcast type: $type" );
				return false;
			}
		}

		/*
		 * Insert the row and get the timestamp the database has assigned.
		 */
		$id = DB::insertRecord( 'taxi_chat', array(
			'from' => $from,
			'to' => $to,
			'to_type' => $to_type,
			'text' => $text
		));
		$time = DB::getValue( "SELECT UNIX_TIMESTAMP(t) FROM taxi_chat
			WHERE msg_id = %d", $id );
		announce_event( EV_CHAT_MESSAGE, array(
			'id' => $id,
			'from' => $from,
			'to' => $to,
			'to_type' => $to_type,
			'text' => $text,
			'time' => $time
		));
		return true;
	}

	static function messages( $acc_id, $since, $until )
	{
		$acc_id = intval( $acc_id );
		$type = DB::getValue( "SELECT type FROM taxi_accounts
			WHERE acc_id = %d
			AND deleted = 0", $acc_id );
		if( !$type ) {
			return null;
		}

		$since = intval( $since );
		$until = intval( $until );
		if( !$until ) $until = time() + 10;

		return DB::getRecords("
			SELECT msg_id, text,
				sender.call_id AS from_call_id,
				sender.type AS from_type,
				UNIX_TIMESTAMP(msg.t) AS utc
			FROM
			(
				SELECT `t`, `msg_id`, `text`, `from` FROM taxi_chat msg
				WHERE msg.from = $acc_id
				AND msg.t BETWEEN FROM_UNIXTIME($since) AND FROM_UNIXTIME($until)

				UNION
				SELECT `t`, `msg_id`, `text`, `from` FROM taxi_chat msg
				WHERE msg.to = $acc_id
				AND msg.t BETWEEN FROM_UNIXTIME($since) AND FROM_UNIXTIME($until)

				UNION
				SELECT `t`, `msg_id`, `text`, `from` FROM taxi_chat msg
				WHERE msg.to_type = 'driver'
				AND msg.t BETWEEN FROM_UNIXTIME($since) AND FROM_UNIXTIME($until)
			) msg
			JOIN taxi_accounts sender
				ON msg.from = sender.acc_id"
		);
	}
}

?>
