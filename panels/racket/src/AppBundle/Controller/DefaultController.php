<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Junker\Symfony\JSendSuccessResponse;
use Junker\Symfony\JSendErrorResponse;

class DefaultController extends Controller
{
	/**
	 * @Route("/", name="homepage")
	 */
	public function indexAction(Request $request)
	{
		// replace this example code with whatever you need
		return $this->render('default/index.html.twig', [
			'base_dir' => realpath($this->getParameter('kernel.root_dir').'/..').DIRECTORY_SEPARATOR,
		]);
	}
	
	/*
	 * All the commands below are just passed to the server
	 * without any processing.
	 */

	/**
	 * @Route("/sym/register")
	 * 
	 * Register a user and return their identifier
	 */
	public function register(Request $req)
	{
		return $this->pass('register', $req);
	}

	/**
	 * @Route("/sym/user-status")
	 * 
	 * Return user info
	 */
	public function userInfo(Request $req)
	{
		return $this->pass('user-info', $req);
	}

	/**
	 * @Route("/sym/orders")
	 * 
	 * Take an order from a user
	 */
	public function makeOrder(Request $req)
	{
		return $this->pass('create-order', $req);
	}

	/**
	 * @Route("/sym/order")
	 * 
	 * Return order info
	 */
	public function getOrder(Request $req)
	{
		return $this->pass('get-order', $req);
	}

	/*
	 * @Route("/sym/cancel")
	 * 
	 * Cancel an order
	 */
	public function cancelOrder(Request $req)
	{
		return $this->pass('cancel-order', $req);
	}

	/*
	 * Passes the request to the server and returns
	 * an HTTP response for the controller.
	 */
	private function pass($cmd, Request $req)
	{
		$body = $req->getContent();
		$data = json_decode($body, true);
		$data['userId'] = $req->query->get('userId');
		$data['orderId'] = $req->query->get('orderId');

		$c = new ServerClient();
		$c->connect();
		$c->send($cmd, $data);
		$ret = $c->receive();
		$c->disconnect();
		
		if($ret['error']) {
			$r = new JSendErrorResponse($ret['error']);
		}
		else {
			$r = new JSendSuccessResponse($ret['data']);
		}
		$r->headers->set('Access-Control-Allow-Origin', '*');
		return $r;
	}
}

class ServerClient
{
	private $socket;

	function connect()
	{
		$errno = $errstr = null;
		$addr = '127.0.0.1:12345';
		$this->socket = stream_socket_client(
			$addr, $errno, $errstr, 10);
		$this->send('auth-client', []);
		$this->receive();
	}

	function disconnect()
	{
		fclose($this->socket);
		$this->socket = null;
	}

	function send($cmd, $data)
	{
		$m = array('command' => $cmd, 'data' => $data);
		return fwrite($this->socket, json_encode($m)."\n");
	}

	function receive()
	{
		$m = json_decode(fgets($this->socket), true);
		return $m['data'];
	}

}
