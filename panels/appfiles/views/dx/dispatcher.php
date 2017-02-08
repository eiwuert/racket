<?php
lib( 'cast' );
dx::init( function()
{
	$arg = argv(1);
	$list = array(
		'car-position',
		'channel-updates',
		'chat-messages',
		'cmd',
		'customer-info',
		'init',
		'locations',
		'ping',
		'prefs',
		'report',
		'route',
		'service-log',
		'service-log-update',
		'queues-snapshot'
	);

	if( !in_array( $arg, $list ) ) {
		return dx::error( "Unknown request" );
	}

	$type = user::get_type();
	if( $type != 'dispatcher' ) {
		return dx::error( "Unauthorised" );
	}
	$arg = str_replace( '-', '_', $arg );
	$func = "q_$arg";
	dx::output( $func() );
});

//--

function q_chat_messages()
{
	$from = vars::get( 'from' );
	$to = vars::get( 'to' );
	$driver_id = vars::get( 'driver_id' );
	if( !$from || !$to || !$driver_id ) {
		return dx::error( "`from`, `to` and `driver_id` arguments are required" );
	}
	return dx_disp::chat_messages( $driver_id, $from, $to );
}

function q_cmd()
{
	$id = user::get_id();
	$type = user::get_type();

	if( $type != 'dispatcher' ) {
		return dx::error( 'Forbidden' );
	}

	$cmd = vars::post( 'cmd' );
	$datastr = alt( vars::post( 'data' ), '{}' );
	if( !$cmd ) {
		return dx::error( "Missing cmd" );
	}
	$data = json_decode( $datastr, true );

	if( !disp_cmd( $id, $cmd, $data, $err ) ) {
		return dx::error( $err );
	}
	return null; // ok
}

function q_route()
{
	$from = vars::get( 'from' );
	$to = vars::get( 'to' );
	if( !$from || !$to ) {
		return dx::error( "from and to parameters are required" );
	}

	$url = setting( 'osrm_address' );
	if( !$url ){
		return dx::error( "No router available" );
	}

	list($lat1, $lon1) = explode(',', $from);
	list($lat2, $lon2) = explode(',', $to);

	$client = new osrm_client($url);
	$route = $client->route([$lat1, $lon1], [$lat2, $lon2]);
	if(!$route) {
		return dx::error('Couldn\'t get route');
	}
	return $route;
}



function q_locations()
{
	$term = vars::get( 'term' );
	return dx_disp::locations( $term );
}

/*
 * When starting, the dispatcher client will have to receive much data
 * to work with.
 */
function q_init()
{
	$acc_id = intval( user::get_id() );
	$init = array();

	/*
	 * Who am I
	 */
	$init['who'] = array(
		'type' => user::get_type(),
		'login' => user::get_login(),
		'id' => $acc_id,
		'settings' => DB::getValue( "SELECT prefs FROM taxi_accounts
			WHERE acc_id = %d", user::get_id() )
	);

	/*
	 * Channel sequence and current time.
	 */
	$init["seq"] = channels::seq( $acc_id );
	$init["now"] = time();
	/*
	 * Service fares.
	 */
	$init['fares'] = dx_disp::fares();
	/*
	 * Drivers and cars lists.
	 */
	$init["drivers"] = dx_disp::drivers();
	$init["cars"] = dx_disp::cars();

	/*
	 * Driver groups
	 */
	$groups = DB::getRecords( "SELECT group_id, name
		FROM taxi_driver_groups" );
	$groups_map = array();
	foreach( $groups as $g ) {
		$id = $g['group_id'];
		$g['queues'] = array();
		$groups_map[$id] = $g;
	}

	/*
	 * Driver groups -> queues relations
	 */
	$r = DB::getRecords( "
		SELECT DISTINCT gr.group_id, q2.queue_id
		-- Get group-queue assignments
		FROM taxi_driver_groups gr
		LEFT JOIN taxi_driver_group_queues gq USING (group_id)

		-- Add parent queues to the list (they will not be in assignments)
		JOIN taxi_queues q USING (queue_id)
		LEFT JOIN taxi_queues q2
			ON q2.queue_id = q.queue_id
			OR q2.queue_id = q.parent_id" );
	$group_queues = array();
	foreach( $r as $row )
	{
		$gid = $row['group_id'];
		$qid = intval( $row['queue_id'] );
		$groups_map[$gid]['queues'][] = $qid;
	}
	cast::table( $groups_map, array(
		'int group_id'
	));
	$init["groups"] = array_values( $groups_map );

	/*
	 * Driver types
	 */
	$init["driver_types"] = DB::getRecords( "SELECT type_id, name
		FROM taxi_driver_types" );
	cast::table( $init["driver_types"], array(
		'int type_id',
		'str name'
	));

	/*
	 * Driver queues
	 */
	$init["queues"] = dx_disp::queues( $acc_id );

	/*
	 * Current queues assignments
	 */
	$init['queues_snapshot'] = q_queues_snapshot();

	/*
	 * Recent orders.
	 */
	$init["recent_orders"] = dx_disp::recent_orders( $acc_id );

	/*
	 * Locations associated with queues.
	 */
	$init["queue_locations"] = dx_disp::queue_locations( $acc_id );

	$areas = DB::getRecords( "
		SELECT name, min_lat, max_lat, min_lon, max_lon
		FROM taxi_service_areas" );

	$options = service_settings::get_settings();
	$options_add = [
		'session' => true,
		'imitations' => true,
		'service_logs' => true,
		'gps_tracking' => true
	];
	$options = array_merge( $options, $options_add );

	/*
	 * Current driver alarms.
	 */
	$init['driver_alarms'] = DB::getRecords("
		SELECT acc_id AS driver_id
		FROM taxi_drivers JOIN taxi_accounts USING (acc_id)
		WHERE alarm_time IS NOT NULL" );


	$init = array_merge( $init, array(
		'map_areas' => $areas,
		'service_options' => $options,
		'sessions' => service_sessions::get_open_sessions_r()
	));

	return $init;
}

/*
 * Get order stats and name of given customer
 */
function q_customer_info()
{
	$phone = Vars::get( 'phone' );
	$info = DB::getRecord( "
		SELECT
			customer_id,
			name,
			blacklist
		FROM taxi_customers
		WHERE phone = '%s'",
		$phone
	);

	if( isset( $info['customer_id'] ) )
	{
		$id = $info['customer_id'];
		$orders = DB::getRecords("
			SELECT DISTINCT
				o.src_addr
			FROM taxi_orders o
			WHERE customer_id = %d
			ORDER BY o.time_created DESC
			LIMIT 5",
			$info['customer_id']
		);
		$addresses = array();
		foreach( $orders as $i => $r ) {
			$addresses[] = parse_address( $r['src_addr'] );
		}
		$info['addresses'] = $addresses;
	}
	return $info;
}

function q_ping()
{
	return array(
		't' => Vars::get( 't' ),
		'server_time' => round( microtime( true ) * 1000 )
	);
}

function q_prefs()
{
	if( $_SERVER['REQUEST_METHOD'] == 'GET' ) {
		return dx::error( "Must be POST" );
	}

	$id = user::get_id();
	$prefs = vars::post( 'prefs' );
	DB::exec( "UPDATE taxi_accounts
		SET prefs = '%s'
		WHERE acc_id = %d", $prefs, $id );
}

function q_channel_updates()
{
	$acc_id = user::get_id();
	$seq = Vars::get( 'last-message-id' );
	$messages = channels::get_messages( $acc_id, $seq );
	return $messages;
}

/*
 * GET queues-snapshot.
 */
function q_queues_snapshot()
{
	$acc_id = user::get_id();
	return dx_disp::queues_snapshot( $acc_id );
}

/*
 * Get last $n messages from the server log.
 */
function q_service_log()
{
	$n = Vars::get( 'n' );
	return service_logs::get_last_messages( $n );
}
/*
 * Get server log updates.
 */
function q_service_log_update()
{
	$id = Vars::get( 'id' );
	return service_logs::get_messages_after( $id );
}

function q_car_position()
{
	$driver_id = vars::get( 'car_id' );
	$r = DB::getRecord( "SELECT latitude, longitude
		FROM taxi_accounts JOIN taxi_drivers USING (acc_id)
		WHERE acc_id = %d",
		$driver_id );
	if( !$r ) {
		return array();
	}
	return array(
		'lat' => $r['latitude'],
		'lon' => $r['longitude']
	);
}

function q_report()
{
	$log = vars::post( 'log' );
	$desc = vars::post( 'desc' );
	log_message( $desc, 'reports' );
	log_message( $log, 'reports' );

	$addr = setting( 'taxi_server_addr' );
	$c = new adm_client();
	$c->connect( $addr );
	$c->dump_memlog( $desc );
	return array();
}

?>
