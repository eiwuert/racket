<?php
class proto_disp_imitations
{
	static function msg_set_imitation_online( $msg, $user )
	{
		$taxi_id = $msg->data( 'taxi_id' );
		$online = $msg->data( 'online' );

		if( service_option( 'sessions' ) )
		{
			$err = self::fix_session( $taxi_id, $online, $user );
			if( $err != null ) {
				return disp_error( $msg->cid, $err );
			}
		}

		set_imitation_online( $taxi_id, $online );
		return disp_result( $msg->cid, true );
	}

	private static function fix_session( $taxi_id, $online, $user )
	{
		if( $online ) {
			return open_157_session( $taxi_id, 0, $user->id );
		}

		close_157_session( $taxi_id, 0, $user->id );
		return null;
	}
}

?>
