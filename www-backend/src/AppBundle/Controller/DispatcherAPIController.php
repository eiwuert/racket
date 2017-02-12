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
	 * @Route("/dispatcher")
	 * @Method("GET")
	 */
	function app()
	{
		return $this->render('dispatcher.html.twig');
	}

	/**
	 * @Route("/dx/dispatcher/customers")
	 * @Method("GET")
	 *
	 * Returns list of customers matching the given phone-name filter
	 * given as query variables.
	 */
	function getCustomers(Request $req)
	{
		if (!$this->accId($req)) {
			return $this->error_response('Unauthorized');
		}
		$nameFilter = $req->query->get('nameFilter');
		$phoneFilter = $req->query->get('phoneFilter');

		$qb = $this->getDoctrine()->getEntityManager()->createQueryBuilder();
		$qb->select('c')
			->from('AppBundle:Customer', 'c')
			->where('c.name LIKE :nameFilter')
			->andWhere('c.phone LIKE :phoneFilter')
			->setParameter('nameFilter', '%'.$nameFilter.'%')
			->setParameter('phoneFilter', '%'.$phoneFilter.'%')
			->setMaxResults(10);
		$list = $qb->getQuery()->getArrayResult();
		return $this->response($list);
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
		$cutoff = new \DateTime();
		$cutoff->setTimestamp(time() - $timeRange);

		$qb = $this->getDoctrine()->getEntityManager()->createQueryBuilder();
		$qb->select('msg')
			->from('AppBundle:ServiceMessage', 'msg')
			->where('msg.datetime >= :cutoff')
			->setParameter('cutoff', $cutoff);
		$list = $qb->getQuery()->getResult();

		$result = [];
		foreach($list as $msg) {
			$result[] = [
				'message_id' => $msg->getId(),
				'text' => $msg->getText(),
				't' => $msg->getDatetime()->getTimestamp()
			];
		}
		return $this->response($result);
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

	/**
	 * @Route("/dx/dispatcher/orders")
	 * @Method("GET")
	 */
	function orders(Request $req)
	{
		$acc_id = $this->accId($req);
		if (!$acc_id) {
			return $this->error_response('Unauthorized');
		}

		$since = $req->query->get('since');
		$until = $req->query->get('until');
		if(!$since) {
			return $this->error_response("Missing `since` parameter");
		}
		if(!$until) {
			$until = time();
		}

		return $this->response($this->api()->orders($since, $until));
	}

	/**
	 * @Route("/dx/dispatcher/login")
	 * @Method("POST")
	 */
	function login(Request $req)
	{
		$name = $req->request->get('name');
		$pass = $req->request->get('password');
		$token = $this->api()->getToken($name, $pass);
		if(!$token) {
			return $this->error_response('Wrong login/password');
		}
		return $this->response([
			'token' => $token
		]);
	}
}
