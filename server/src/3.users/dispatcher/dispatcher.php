<?php
init( function()
{
	$NS = 'proto_dispatcher::';
	listen_events( EV_TAXI_POSITION, $NS.'ev_taxi_position' );
	listen_events( EV_TAXI_ALARM_ON, $NS.'ev_taxi_alarm_on' );
	listen_events( EV_TAXI_ALARM_OFF, $NS.'ev_taxi_alarm_off' );
	listen_events( EV_LOGIN, $NS.'ev_loginout' );
	listen_events( EV_LOGOUT, $NS.'ev_loginout' );
	listen_events( EV_TAXI_BUSY, $NS.'ev_taxi_busy' );

	disp_broadcast( 'sync' );
});

class proto_dispatcher
{
	static function msg_send_text( $msg, $user )
	{
		$cid = $msg->cid;
		$taxi_id = disp_get_driver_id( $msg, $user );
		$text = trim( $msg->data( 'text' ) );
		if( !$taxi_id ) {
			return disp_error( $cid, "Unknown taxi" );
		}
		if( !$text ) {
			return disp_error( $cid, "No text to send" );
		}
		if( !send_text_to_taxi( $taxi_id, $text ) ) {
			return disp_error( $cid, "Could not send the text" );
		}
		return disp_result( $cid, true );
	}

	static function ev_taxi_position( $event )
	{
		$taxi_id = $event->data['taxi_id'];
		$pos = $event->data['pos'];
		$data = array(
			'driver_id' => $taxi_id,
			'latitude' => $pos->lat,
			'longitude' => $pos->lon
		);
		disp_broadcast( 'driver-position', $data );
	}

	static function ev_taxi_alarm_on( $event )
	{
		$taxi_id = $event->data['taxi_id'];
		disp_broadcast( 'driver-alarm-on', array(
			'driver_id' => $taxi_id
		));
	}

	static function ev_taxi_alarm_off( $event )
	{
		$taxi_id = $event->data['taxi_id'];
		disp_broadcast( 'driver-alarm-off', array(
			'driver_id' => $taxi_id
		));
	}

	static function ev_loginout( $event )
	{
		$user = $event->data['user'];
		if( $user->type != T_TAXI ) {
			return;
		}

		$online = ($event->type == EV_LOGIN) ? 1 : 0;
		disp_broadcast( 'driver-changed', array(
			'driver_id' => $user->id,
			'diff' => array(
				'is_online' => $online
			)
		));
	}

	static function ev_taxi_busy( $event )
	{
		disp_broadcast( 'driver-busy', array(
			'driver_id' => $event->data["taxi_id"],
			'busy' => $event->data["busy"]
		));
	}
}
?>
