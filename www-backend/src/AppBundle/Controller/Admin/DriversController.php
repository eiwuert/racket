<?php

/*
 * Deals with drivers, driver groups, queues
 */

namespace AppBundle\Controller\Admin;

use AppBundle\address;
use AppBundle\Controller\Admin\BaseController;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DriversController extends BaseController
{
	/**
	 * @Route("/service/driver-groups/{id}", name="driver-group")
	 */
	function driverGroup(Request $req, $id)
	{
		$group = $this->getDoctrine()->getRepository('AppBundle:DriverGroup')->find($id);
		if (!$group) {
			throw new NotFoundHttpException;
		}
		
		$queues = $this->find('Queue', ['deleted' => false]);

		if($req->isMethod('POST')) {
			$em = $this->getDoctrine()->getManager();
			$this->saveDriverGroup($group, $queues, $req);
			$em->persist($group);
			$em->flush();
		}

		return $this->render('admin/driver-group.html.twig', ['queues' => $queues, 'group' => $group]);
	}
	
	private function saveDriverGroup($g, $queues, Request $req)
	{
		$g->setName($req->request->get('group-name'));

		$Q = $req->request->get('queues', []);
		foreach($queues as $q) {
			if(in_array($q->getId(), $Q)) {
				$g->addQueue($q);
			}
			else {
				$g->removeQueue($q);
			}
		}
	}
	
	/**
	 * @Route("/service/drivers", name="driversList")
	 */
	function driversList()
	{
		$driverGroups = $this->getDoctrine()->getManager()
				->createQuery('SELECT g, d, a, c
				FROM AppBundle:DriverGroup g
				LEFT JOIN g.drivers d WITH d.deleted = 0
				LEFT JOIN d.car c
				LEFT JOIN d.account a
				')->getResult();
		return $this->render('admin/drivers.html.twig', ['driverGroups' => $driverGroups]);
	}

	/**
	 * @Route("/service/driver/{id}", name="driver")
	 */
	function driver(Request $req, $id)
	{
		$driver = $this->findOne('Driver', ['id' => $id, 'deleted' => false]);
		if ($req->isMethod('POST')) {
			$account = $driver->getAccount();
			$this->saveAccount($account, $req);
			$this->saveDriver($driver, $req);
			$em = $this->getDoctrine()->getManager();
			$em->persist($driver);
			$em->flush();
		}

		$freeCars = $this->getDoctrine()->getManager()->createQuery('
			SELECT c FROM AppBundle:Car c 
			WHERE c.id NOT IN
				(SELECT tc.id FROM AppBundle:Driver d JOIN d.car tc)')
			->getResult();
		$data = [
			'driver' => $driver,
			'freeCars' => $freeCars,
			'groups' => $this->find('DriverGroup', ['deleted' => false])
		];
		return $this->render('admin/driver.twig', $data);
	}

	private function saveDriver($driver, Request $req)
	{
		$car_id = $req->request->get('car_id');
		$car = $this->findOne('Car', ['id' => $car_id]);

		$group_id = $req->request->get('group_id');
		$group = $this->findOne('DriverGroup', ['id' => $group_id]);

		$driver->setIsFake($req->request->get('driver-fake') ? true : false);
		$driver->setIsBrig($req->request->get('driver-brig') ? true : false);
		$driver->setCar($car);
		$driver->setGroup($group);
	}
	
	function delete_driver()
	{
		$id = argv(1);
		if (!$id) {
			warning("delete_driver: missing driver id");
			return false;
		}

		$driver = new driver($id, 'acc_id');
		if (!$driver->acc_id()) {
			warning("delete_driver: no acc_id");
			return false;
		}

		taxi::delete_taxi($id);
		taxi_accounts::delete($driver->acc_id());
	}
	
	/**
	 * @Route("/service/queues", name="queuesList")
	 */
	function queuesList()
	{
		$Q = $this->getDoctrine()->getManager()->createQuery("
			SELECT q FROM AppBundle:Queue q
			ORDER BY q.order")
			->getResult();
		//$Q = $this->getDoctrine()->getRepository('AppBundle:Queue')->findAll();
		return $this->render('admin/queues.twig', ['queues' => $Q]);
	}

	/**
	 * @Route("/service/queues/{id}", name="queue")
	 */
	function queue(Request $req, $id)
	{
		$q = $this->findOne('Queue', ['id' => $id, 'deleted' => false]);
		$driverGroups = $this->find('DriverGroup', ['deleted' => false]);
		if($req->isMethod('POST')) {
			$this->saveQueue($q, $driverGroups, $req);
			$em = $this->getDoctrine()->getManager();
			$em->persist($q);
			$em->flush();
		}
		$addr = address::parse_std($q->getAddress());
		return $this->render('admin/queue.twig', ['queue' => $q, 'driverGroups' => $driverGroups, 'addr' => $addr]);
	}

	private function saveQueue($q, $groups, Request $req)
	{
		$q->setName($req->request->get('name'));
		$q->setOrder($req->request->get('order'));

		$addr = address::write(array(
			'place' => $req->request->get('place'),
			'street' => $req->request->get('street'),
			'house' => $req->request->get('house'),
			'building' => $req->request->get('building')
		));
		$q->setAddress($addr);
		$q->setLatitude($req->request->get('latitude'));
		$q->setLongitude($req->request->get('longitude'));
		$q->setRadius($req->request->get('radius'));

		$list = $req->request->get('driver_groups', []);
		foreach($groups as $g) {
			if(in_array($g->getId(), $list)) {
				$q->addDriverGroup($g);
			} else {
				$q->removeDriverGroup($g);
			}
		}
	}
	
	function delete_queue()
	{
		$qid = argv(1);

		$r = DB::getRecord("SELECT loc_id FROM taxi_queues
		WHERE queue_id = %d", $qid);
		if (!$r) {
			return 'Not found';
		}
		if ($r['loc_id']) {
			return 'Can\'t delete a checkpoint queue.';
		}
		DB::exec("DELETE FROM taxi_queues WHERE queue_id = %d", $qid);
	}
}
