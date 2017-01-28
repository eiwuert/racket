<?php

/*
 * Entry point, calls one of the query functions and returns the output.
 */
function get_response()
{
	/*
	 * Query functions and their minimal argument counts.
	 */
	$queries = array(
		'street_suggestions' => 2, // /place/term/
		'place_suggestions' => 1, // /term/
		'point_address' => 2, // /latitude/longitude/
		'address_bounds' => 1 // /place[/street/house/building/]
	);
	/*
	 * Make sure we have a valid query name.
	 */
	$name = argv(1);
	if( !$name || !isset( $queries[$name] ) ) {
		error_notfound();
	}
	/*
	 * Get arguments.
	 */
	$args = array();
	$i = 2;
	while( ($arg = argv($i)) !== null && $i < 10 ) {
		$args[] = urldecode( $arg );
		$i++;
	}

	if( count( $args ) < $queries[$name] ) {
		return json_error( "Not enough parameters for the '$name' query." );
	}

	$data = call_user_func_array( $name, $args );
	if( !array_key_exists( 'error', $data ) ) {
		$data['error'] = 0;
	}
	return $data;
}

announce_json();
echo json_encode( get_response() );


/*
 * Error message.
 */
function json_error( $message )
{
	return array(
		'error' => 1,
		'message' => $message
	);
}

/*
 * Returns array of street names, in the given place, containing $term.
 */
function street_suggestions( $place, $term )
{
	$list = taxi_addr::suggest_streets( $term, $place );
	return array( 'list' => $list );
}

/*
 * Returns an array of place names with the given term in them.
 */
function place_suggestions( $term )
{
	$r = taxi_addr::suggest_places( $term );
	return array( 'list' => $r );
}

/*
 * Returns an address for the point with given coordinates.
 */
function point_address( $lat, $lon )
{
	if( !$lat || !$lon ) {
		return json_error( "Missing argument" );
	}
	
	$result = [
		'latitude' => $lat,
		'longitude' => $lon
	];

	$api = new \Yandex\Geo\Api();
	$api->setPoint($lon, $lat);
	$api->setLimit(1)->load();
	
	$response = $api->getResponse();
	if($response->getFoundCount() == 0) {
		$result['error'] = 1;
		$result['message'] = 'Could not determine the address';
		return $result;
	}
	
	$items = $response->getList();
	$item = $items[0];
	$data = $item->getData();
	
	$map = [
		'address_place' => 'LocalityName',
		'address_street' => 'ThoroughfareName',
		'address_house' => 'PremiseNumber',
		'address_building' => '_'
	];
	
	foreach($map as $k1 => $k2) {
		if(isset($data[$k2])) {
			$result[$k1] = $data[$k2];
		}
		else {
			$result[$k1] = '';
		}
	}
	
	if(strpos($result['address_house'], 'к')) {
		list($house, $building) = explode('к', $result['address_house'], 2);
		$result['address_house'] = $house;
		$result['address_building'] = $building;
	}

	return $result;
}

/*
 * Returns bounds for the given address. The bounds is a dict with
 * fields "lat", "lon", "min_lat", "max_lat", "min_lon", "max_lon".
 */
function address_bounds( $place, $street = null, $house = null, $building = null )
{
	$addr = array_filter( array( $place, $street, $house, $building ) );
	$addr = implode( ', ', $addr );
	
	$api = new \Yandex\Geo\Api();
	$api->setQuery($addr);
	$api->setLimit(1);
	$api->load();
	
	$response = $api->getResponse();
	if($response->getFoundCount() == 0) {
		return json_error( "Could not determine the address location." );
	}
	
	$item = $response->getFirst();
	
	$lat = $item->getLatitude();
	$lon = $item->getLongitude();
	
	// Fake bounding box
	$d = 0.0001;
	$box = array( $lat - $d, $lat + $d, $lon - $d, $lon + $d );

	return array(
		'lat' => $lat,
		'lon' => $lon,
		'min_lat' => $box[0],
		'max_lat' => $box[1],
		'min_lon' => $box[2],
		'max_lon' => $box[3]
	);
}

?>
