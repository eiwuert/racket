<?php

/*
 * https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md
 */
class osrm_client
{
	private $host_url;

	function __construct($host_url)
	{
		$this->host_url = rtrim($host_url, '/');
	}

	function route($from, $to)
	{
		list($lat1, $lon1) = $from;
		list($lat2, $lon2) = $to;
		$url = $this->host_url . '/route/v1/car/'."$lon1,$lat1;$lon2,$lat2";
		$raw = file_get_contents($url);
		if(!$raw) return null;

		$data = json_decode($raw, true);
		$route = $data['routes'][0];
		return [
			'route_geometry' => osrm_decode($route['geometry']),
			'route_summary' => [
				'total_distance' => $route['distance']
			]
		];
	}
}

/*
 * Decode a string into an array of pairs of float values (polyline).
 * This is the algorithm that Google Maps uses, but with 6 numbers
 * instead of 5.
 */
function osrm_decode( $s )
{
	$precision = pow( 10, - 5 );
	$len = strlen( $s );
	$index = 0;
	$lat = 0;
	$lng = 0;
	$a = array();

	while( $index < $len)
	{
		$shift = 0;
		$result = 0;

		do {
			$b = ord( $s[$index++] ) - 63;
			$result |= ($b & 0x1f) << $shift;
			$shift += 5;
		} while ($b >= 0x20);

		$dlat = (($result & 1) ? ~($result >> 1) : ($result >> 1));
		$lat += $dlat;
		$shift = 0;
		$result = 0;
		do {
			$b = ord($s[$index++]) - 63;
			$result |= ($b & 0x1f) << $shift;
			$shift += 5;
		} while ($b >= 0x20);
		$dlng = (($result & 1) ? ~($result >> 1) : ($result >> 1));
		$lng += $dlng;
		$a[] = array( $lat * $precision, $lng * $precision );
	}
	return $a;
}

?>
