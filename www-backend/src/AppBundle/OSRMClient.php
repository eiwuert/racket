<?php

namespace AppBundle;

/*
 * https://github.com/Project-OSRM/osrm-backend/blob/master/docs/http.md
 */

class OSRMClient
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
		$url = $this->host_url.'/route/v1/car/'."$lon1,$lat1;$lon2,$lat2";
		$raw = file_get_contents($url);
		if (!$raw) {
			return null;
		}

		$data = json_decode($raw, true);
		$route = $data['routes'][0];
		return [
			'route_geometry' => decode($route['geometry']),
			'route_summary' => [
				'total_distance' => $route['distance']
			]
		];
	}

}

class decoder
{
	private $bytes;

	function __construct($bytes)
	{
		$this->bytes = $bytes;
	}

	function nextValue()
	{
		$shift = 0;
		$result = 0;

		while (1) {
			// Every byte was added 63 to keep the values printable
			$b = ord(array_shift($this->bytes)) - 63;

			// 5 bits worth of data
			$result |= (($b & 0x1f) << $shift);
			$shift += 5;

			// The 6th bit is set to one if more bytes have to be read
			if ($b & 0x20 == 0) {
				break;
			}
		}

		// If the first bit is one, then the original value is
		// negative and its bit sequence is inverted.
		if ($result & 1 == 1) {
			$result = ~$result;
		}

		// Discard the sign bit
		$result >>= 1;

		return $result;
	}

}

/*
 * Decode a string into an array of pairs of float values (polyline).
 * This is the algorithm used by Google's maps.
 */
function decode($s)
{
	$precision = pow(10, - 5);
	$dec = new decoder($s);

	$a = array();
	$lat = 0;
	$lon = 0;
	while ($dec->more()) {
		$lat += $dec->nextValue();
		$lon += $dec->nextValue();
		$a[] = array($lat * $precision, $lon * $precision);
	}
	return $a;
}
