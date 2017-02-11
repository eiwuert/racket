<?php

namespace AppBundle\Controller;

use AppBundle\DispatcherAPI;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class DispatcherAPIController extends Controller
{
	private function api()
	{
		return new DispatcherAPI($this->get('database_connection'));
	}

	private function accId(Request $req)
	{
		$token = $req->query->get('token');
		return $this->api()->checkToken($token);
	}

	private function response($val)
	{
		return new JsonResponse([
			'data' => $val,
			'errno' => 0,
			'errstr' => 'ok'
		]);
	}

	private function error_response($str)
	{
		return new JsonResponse([
			'errno' => 1,
			'errstr' => $str
		]);
	}

	/**
	 * @Route("/dx/dispatcher/customers")
	 * @Method("GET")
	 */
	function getCustomers(Request $req)
	{
		if (!$this->accId($req)) {
			return $this->error_response('Unauthorized');
		}

		$nameFilter = $req->query->get('nameFilter');
		$phoneFilter = $req->query->get('phoneFilter');
		return $this->response($this->api()->getCustomers($nameFilter, $phoneFilter));
	}

	/**
	 * @Route("/dx/dispatcher/car-position")
	 * @Method("GET")
	 * 
	 * Returns current position of the driver.
	 */
	function carPosition(Request $req)
	{
		if (!$this->accId($req)) {
			return $this->error_response('Unauthorized');
		}

		$driver_id = $req->query->get('car_id');
		return $this->response($this->api()->driverPosition($driver_id));
	}

	/**
	 * @Route("/dx/dispatcher/channel-updates")
	 * @Method("GET")
	 */
	function channelUpdates(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}

		$seq = $req->query->get('last-message-id');
		return $this->response($this->api()->getChannelMessages($acc_id, $seq));
	}

	/**
	 * @Route("/dx/dispatcher/chat-messages")
	 * @Method("GET")
	 */
	function chatMessages(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}

		$from = $req->query->get('from');
		$to = $req->query->get('to');
		$driver_id = $req->query->get('driver_id');
		if (!$from || !$to || !$driver_id) {
			return $this->error_response("`from`, `to` and `driver_id` arguments are required");
		}
		return $this->response($this->api()->getChatMessages($driver_id, $from, $to));
	}

	/**
	 * @Route("/dx/dispatcher/cmd")
	 * @Method("POST")
	 */
	function cmd(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}

		$cmd = $req->request->get('cmd');
		$datastr = $req->request->get('data');
		if (!$datastr)
			$datastr = '{}';
		if (!$cmd) {
			return $this->error_response("Missing cmd");
		}
		$data = json_decode($datastr, true);

		$client = $this->get('dispatcher_client');
		$ok = $client->connect();
		if (!$ok) {
			return $this->error_response('Could not connect');
		}
		if (!$client->login($acc_id)) {
			return $this->error_response('Could not login');
		}
		if (!$client->cmd($cmd, $data)) {
			return $this->error_response($client->error());
		}
		return $this->response(null);
	}

	/**
	 * @Route("/dx/dispatcher/customer-info")
	 * @Method("GET")
	 */
	function customerInfo(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}
		$phone = $req->query->get('phone');
		return $this->response($this->api()->customerInfo($phone));
	}

	/**
	 * @Route("/dx/dispatcher/init")
	 * @Method("GET")
	 */
	function init(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}
		return $this->response($this->api()->init($acc_id));
	}

	/**
	 * @Route("/dx/dispatcher/locations")
	 * @Method("GET")
	 */
	function locations(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}
		$term = $req->query->get('term');
		return $this->response($this->api->findLocations($term));
	}

	/**
	 * @Route("/dx/dispatcher/ping")
	 * @Method("GET")
	 */
	function ping(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}
		return $this->response(array(
				't' => $req->query->get('t'),
				'server_time' => round(microtime(true) * 1000)
		));
	}

	/**
	 * @Route("/dx/dispatcher/prefs")
	 * @Method("POST")
	 */
	function prefs(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}
		$prefs = $req->request->get('prefs');
		return $this->response($this->api()->savePrefs($acc_id, $prefs));
	}

	/**
	 * @Route("/dx/dispatcher/route")
	 * @Method("GET")
	 */
	function route(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}

		$from = $req->query->get('from');
		$to = $req->query->get('to');
		if (!$from || !$to) {
			return $this->error_response("from and to parameters are required");
		}

		list($lat1, $lon1) = explode(',', $from);
		list($lat2, $lon2) = explode(',', $to);

		$client = $this->get('osrm_client');
		$route = $client->route([$lat1, $lon1], [$lat2, $lon2]);
		if (!$route) {
			return $this->error_response('Couldn\'t get route');
		}
		return $this->response($route);
	}

	/**
	 * @Route("/dx/dispatcher/service-log")
	 * @Method("GET")
	 */
	function serviceLog(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}
		$timeRange = $req->query->get('timeRange');
		return $this->response($this->api()->getLastServiceMessages($timeRange));
	}

	/**
	 * @Route("/dx/dispatcher/queues-snapshot")
	 * @Method("GET")
	 */
	function queuesSnapshot(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}
		return $this->response($this->api()->getQueuesSnapshot());
	}
}
