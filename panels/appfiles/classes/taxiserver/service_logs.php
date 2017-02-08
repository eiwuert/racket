<?php
class service_logs
{
	/*
	 * Returns messages (as arrays) for given service, for given time
	 * period.
	 */
	static function get_messages( $from, $to = null )
	{
		if( !$to ) $to = time();
		return DB::getRecords( "
			SELECT
				message_id,
				UNIX_TIMESTAMP(t) AS t,
				text
			FROM taxi_logs L
			WHERE L.t BETWEEN FROM_UNIXTIME(%d) AND FROM_UNIXTIME(%d)
			ORDER BY t", $from, $to
		);
	}

	/*
	 * Returns last $n messages for the given service.
	 */
	static function get_last_messages( $n = 100 )
	{
		return DB::getRecords("
			SELECT * FROM (
				SELECT message_id,
					UNIX_TIMESTAMP(t) AS t,
					text
				FROM taxi_logs L
				ORDER BY L.t DESC
				LIMIT %d) rev
			ORDER BY t
		", $n );
	}

	/*
	 * Returns service messages after the message with the given id.
	 */
	static function get_messages_after( $id )
	{
		return DB::getRecords("
			SELECT message_id,
				UNIX_TIMESTAMP(t) AS t,
				text
			FROM taxi_logs L
			WHERE message_id > %d
			ORDER BY L.t
		", $id );
	}

	/*
	 * Adds a message to the log with given service id and current
	 * timestamp.
	 */
	static function add_message( $text )
	{
		return DB::insertRecord( 'taxi_logs', array(
			'text' => $text
		));
	}
}
?>
