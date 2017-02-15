<?php

namespace AppBundle\Controller\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;


class BaseController extends Controller
{
	protected function find($class, $filter) {
		return $this->getDoctrine()->getRepository('AppBundle:'.$class)->findBy($filter);
	}
	
	protected function findOne($class, $filter) {
		return $this->getDoctrine()->getRepository('AppBundle:'.$class)->findOneBy($filter);
	}
	
	protected function save($obj)
	{
		$em = $this->getDoctrine()->getManager();
		$em->persist($obj);
		return $em;
	}
	
	protected function saveAccount($account, Request $req)
	{
		$login = $req->request->get('login');
		$name = $req->request->get('acc-name');
		$callId = $req->request->get('call_id');

		if ($req->request->get('set-password') || !$account->getId()) {
			$pass = $req->request->get('password');
			$account->setPassword($pass);
		}

		$account->setLogin($login);
		$account->setCallId($callId);
		$account->setName($name);

		//if (taxi_accounts::exists('dispatcher', $login)) {
		//	return "Имя пользователя &laquo;$login&raquo; уже занято.";
		//}
	}
}
