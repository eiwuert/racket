<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Yandex\Geo\Api;

/**
 * Controller for geolocation queries
 */
class MapdataController
{
	private function error($message)
	{
		return new JsonResponse([
			'error' => 1,
			'message' => $message
		]);
	}

	/**
	 * @Route("/json/mapdata/point_address/{lat}/{lon}")
	 * Returns an address for the point with given coordinates.
	 */
	function pointAddress($lat, $lon)
	{
		$result = [
			'latitude' => $lat,
			'longitude' => $lon
		];

		$api = new Api();
		$api->setPoint($lon, $lat);
		$api->setLimit(1)->load();

		$response = $api->getResponse();
		if ($response->getFoundCount() == 0) {
			$result['error'] = 1;
			$result['message'] = 'Could not determine the address';
			return new JsonResponse($result);
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

		foreach ($map as $k1 => $k2) {
			if (isset($data[$k2])) {
				$result[$k1] = $data[$k2];
			}
			else {
				$result[$k1] = '';
			}
		}

		if (strpos($result['address_house'], 'к')) {
			list($house, $building) = explode('к', $result['address_house'], 2);
			$result['address_house'] = $house;
			$result['address_building'] = $building;
		}

		return new JsonResponse($result);
	}

	/**
	 * @Route("/json/mapdata/address_bounds/{spec}", requirements={"spec": ".+"})
	 * Returns bounds for the given address. The bounds is a dict with
	 * fields "lat", "lon", "min_lat", "max_lat", "min_lon", "max_lon".
	 */
	function addressBounds($spec)
	//function addressBounds($place, $street = null, $house = null, $building = null)
	{
		$parts = explode('/', $spec);
		$addr = implode(', ', $parts);

		$api = new Api();
		$api->setQuery($addr);
		$api->setLimit(1);
		$api->load();

		$response = $api->getResponse();
		if ($response->getFoundCount() == 0) {
			return $this->error("Could not determine the address location.");
		}

		$item = $response->getFirst();

		$lat = $item->getLatitude();
		$lon = $item->getLongitude();

		// Fake bounding box
		$d = 0.0001;
		$box = array($lat - $d, $lat + $d, $lon - $d, $lon + $d);

		return new JsonResponse(array(
			'lat' => $lat,
			'lon' => $lon,
			'min_lat' => $box[0],
			'max_lat' => $box[1],
			'min_lon' => $box[2],
			'max_lon' => $box[3]
		));
	}

	/**
	 * @Route("/json/mapdata/place_suggestions/{term}")
	 */
	function placeSuggestions($term)
	{
		return new JsonResponse([
			'list' => []
		]);
	}

	/**
	 * @Route("/json/mapdata/street_suggestions/{place}/{term}")
	 */
	function streetSuggestions($place, $term)
	{
		return new JsonResponse([
			'list' => []
		]);
	}
}
