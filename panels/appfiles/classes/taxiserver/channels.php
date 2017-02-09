<?php
class channels
{
	/*
	 * Puts a message to the channel.
	 */
	static function broadcast( $channel_id, $loc_id, $type, $data = array() )
	{
		if( !$channel_id ) return false;

		$message = array(
			'type' => $type,
			'data' => $data
		);

		return DB::insertRecord( 'taxi_channels', array(
			'channel_id' => $channel_id,
			'loc_id' => $loc_id,
			'message' => json_encode( $message )
		));
	}

	/*
	 * Returns messages with id greater than $start_message_id.
	 * If $start_message_id is null, an "init" message is returned.
	 */
	static function get_messages( $acc_id, $start_message_id = null )
	{
		/*
		 * If no sequence number is given, return init message with
		 */
		if( $start_message_id === null ) {
			return array(
				'message_id' => self::seq( $acc_id ),
				'type' => 'init'
			);
		}

		$acc_id = intval( $acc_id );
		$start_message_id = intval( $start_message_id );

		$where = "message_id > $start_message_id";
		$filter = self::filter( $acc_id );
		if( $filter ) {
			$where .= " AND " . $filter;
		}

		$q = "SELECT message_id, message
			FROM taxi_channels
			WHERE $where
			ORDER BY message_id";

		$A = DB::getRecords( $q );
		$messages = array();
		foreach( $A as $a )
		{
			$m = json_decode( $a['message'], true );
			$m['message_id'] = $a['message_id'];
			$messages[] = $m;
		}
		return $messages;
	}

	static function seq( $acc_id )
	{
		$where = self::filter( $acc_id );
		if( $where == '' ) {
			trigger_error( "Empty filter" );
			return 0;
		}
		$id = DB::getValue( "SELECT MAX(message_id)
			FROM taxi_channels
			WHERE $where" );
		if( !$id ) $id = '0';
		return $id;
	}

	private static function filter( $acc_id )
	{
		$filter = array();
		if( $acc_id ) {
			$filter[] = "acc_id IS NULL OR acc_id = $acc_id";
		}
		if( empty( $filter ) ) {
			return '';
		}

		return "(" . implode( ") AND (", $filter ) . ")";
	}
}

?>
