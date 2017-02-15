<?php

namespace AppBundle\Controller\Admin;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;

class ServiceController extends BaseController
{
	/**
	 * @Route("/service", name="serviceHome")
	 */
	function home()
	{
		return $this->render('admin/home.twig');
	}

	/**
	 * @Route("/service/login", name="serviceLogin")
	 */
	function login()
	{
		$auth = $this->get('security.authentication_utils');
		$err = $auth->getLastAuthenticationError();
		$name = $auth->getLastUserName();
		return $this->render('admin/login.twig', ['name' => $name, 'error' => $err]);
	}

	/**
	 * @Route("/service/dispatchers", name="dispatchersList")
	 */
	function dispatchersList()
	{
		$dispatchers = $this->getDoctrine()->getManager()->createQuery("
			SELECT d FROM AppBundle:Account d
			WHERE d.type = 'dispatcher'
			AND d.deleted = 0")
			->getResult();
		return $this->render('admin/dispatchers.twig', ['dispatchers' => $dispatchers]);
	}

	/**
	 * @Route("/service/dispatchers/{id}", name="dispatcher")
	 */
	function dispatcher(Request $req, $id)
	{
		$em = $this->getDoctrine()->getManager();
		$dispatcher = $em->createQuery("
			SELECT d FROM AppBundle:Account d
			WHERE d.type = 'dispatcher'
			AND d.id = :id
			AND d.deleted = 0")
			->setParameter('id', $id)
			->getOneOrNullResult();
		if (!$dispatcher) {
			throw $this->createNotFoundException();
		}

		$errors = [];
		if ($req->isMethod('POST')) {
			$errors = $this->saveAccount($dispatcher, $req);
			if (empty($errors)) {
				$em->persist($dispatcher);
				$em->flush();
			}
		}
		return $this->render('admin/dispatcher.twig', ['dispatcher' => $dispatcher, 'errors' => $errors]);
	}

	/**
	 * @Route("/service/locations", name="locationsList")
	 */
	function locationsList()
	{
		$L = $this->getDoctrine()->getRepository('AppBundle:Location')->findAll();
		return $this->render('admin/locations.twig', ['locations' => $L]);
	}

	/**
	 * @Route("/service/location/{id}", name="location")
	 */
	function location(Request $req, $id)
	{
		$loc = $this->findOne('Location', ['id' => $id, 'deleted' => false]);
		if ($req->isMethod('POST')) {
			$this->saveLocation($loc, $req);
			$em = $this->getDoctrine()->getManager();
			$em->persist($loc);
			$em->flush();
		}
		$addr = \AppBundle\address::parse_std($loc->getAddress());
		return $this->render('admin/location.twig', ['location' => $loc, 'address' => $addr]);
	}

	private function saveLocation($loc, Request $req)
	{
		$lat = $req->request->get('a-latitude');
		$lon = $req->request->get('a-longitude');

		$K = array('place', 'street', 'house', 'building');
		$addr = array();
		foreach ($K as $k) {
			$addr[$k] = $req->request->get("a-$k");
		}

		$loc->setName($req->request->get('name'));
		$loc->setLatitude($lat);
		$loc->setLongitude($lon);
		$loc->setAddress(\AppBundle\address::write($addr));
	}

	/**
	 * @Route("/service/settings", name="settings")
	 */
	function settings()
	{
		return $this->render('admin/settings.twig');
	}

	/**
	 * @Route("/service/password", name="changePassword")
	 */
	function changePassword(Request $req)
	{
		$errors = [];
		if ($req->isMethod('POST')) {
			$error = $this->setPassword($req);
			if (!$error) {
				$error = 'Пароль изменён';
			}
			$errors[] = $error;
		}

		return $this->render('admin/password.twig', ['errors' => $errors]);
	}

	private function setPassword(Request $req)
	{
		$user = $this->get('security.token_storage')->getToken()->getUser();
		$old = $req->request->get('current-password');
		$new = $req->request->get('new-password');
		$new2 = $req->request->get('new-password-confirm');

		if ($new != $new2) {
			return "Две строки с новым паролем не совпали.";
		}

		if (!$user->checkPassword($old)) {
			return "Текущий пароль указан неверно.";
		}

		$user->setPassword($new);
		$this->save($user)->flush();
		return null;
	}

	/**
	 * @Route("/sym/reports", name="reportsList")
	 */
	function reportsList()
	{
		return $this->render('admin/reports.twig');
	}
}
