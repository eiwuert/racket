<?php
/*
 * Deals with cars, car groups, fares
 */

namespace AppBundle\Controller\Admin;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CarsController extends BaseController
{
	/**
	 * @Route("/service/cars", name="carsList")
	 */
	function carsList(Request $req)
	{
		if($req->isMethod('POST')) {
			if($req->request->get('operation') != 'delete') {
				throw new \RuntimeException('Unknown operation');
			}
			$this->deleteCars($req);
		}
		return $this->showCarsList();
	}

	private function showCarsList()
	{
		$groups = $this->getDoctrine()->getManager()->createQuery('
			SELECT g, c, d, a FROM AppBundle:CarGroup g
			LEFT JOIN g.cars c WITH c.deleted = 0
			LEFT JOIN c.driver d
			LEFT JOIN d.account a
			WHERE g.deleted = 0')
			->getResult();
		
		return $this->render('admin/cars-list.html.twig', [
			'groups' => $groups,
			'fares' => $this->find('Fare', ['deleted' => false])
		]);
	}
	
	private function deleteCars(Request $req)
	{
		$ids = $req->request->get('selection');
		$cars = $this->find('Car', ['id' => $ids]);
		$em = $this->getDoctrine()->getManager();
		foreach($cars as $car) {
			$car->setDriver(null);
			$car->setDeleted(true);
			$em->persist($car);
		}
		$em->flush();
	}
	
	/**
	 * @Route("/service/car-group/{id}", name="carGroup")
	 */
	function carGroup(Request $req, $id)
	{
		$db = $this->getDoctrine();
		$group = $db->getRepository('AppBundle:CarGroup')
			->findOneBy(['id' => $id, 'deleted' => false]);
		if (!$group) {
			throw new NotFoundHttpException;
		}
		$fares = $db->getRepository('AppBundle:Fare')->findAll();
		if ($req->isMethod('POST')) {
			$em = $db->getManager();
			$this->saveCarGroup($group, $fares, $req);
			$em->persist($group);
			$em->flush();
		}
		return $this->render('admin/car-group.html.twig', ['group' => $group, 'fares' => $fares]);
	}

	/**
	 * @Route("/service/car-groups/{id}/delete", name="deleteCarGroup")
	 * @Method("POST")
	 */
	function deleteCarGroup($id)
	{
		$g = $this->findOne('CarGroup', ['id' => $id]);
		$g->setDeleted(true);
		$this->save($g)->flush();
		return $this->redirectToRoute('carsList');
	}

	/**
	 * @Route("/service/car-groups", name="carGroupsList")
	 * @Method("POST")
	 */
	function carGroups(Request $req)
	{
		$group = new \AppBundle\Entity\CarGroup();
		$fares = $this->find('Fare', ['deleted' => false]);
		$this->saveCarGroup($group, $fares, $req);
		$this->save($group)->flush();
		return $this->showCarsList();
	}

	private function saveCarGroup($group, $fares, Request $req)
	{
		$group->setName($req->request->get('group-name'));
		$fareIds = $req->request->get('fare-id', []);
		foreach ($fares as $fare) {
			if (in_array($fare->getId(), $fareIds)) {
				$group->addFare($fare);
			}
			else {
				$group->removeFare($fare);
			}
		}
	}

	/**
	 * @Route("/service/cars/{id}", name="carEdit", requirements={"id": "\d+"})
	 */
	function car(Request $req, $id)
	{
		$car = $this->findOne('Car', ['id' => $id, 'deleted' => false]);
		if (!$car) {
			throw new NotFoundHttpException();
		}
		if($req->isMethod('POST')) {
			$this->saveCar($car, $req);
			$em = $this->getDoctrine()->getManager();
			$em->persist($car);
			$em->flush();
		}
		return $this->carForm($car);
	}
	
	/**
	 * @Route("/service/cars/new", name="newCar")
	 */
	function newCar(Request $req)
	{
		$car = new \AppBundle\Entity\Car();
		if($req->isMethod('POST')) {
			$this->saveCar($car, $req);
			$this->save($car)->flush();
			return $this->redirectToRoute('carEdit', ['id' => $car->getId()]);
		}
		return $this->carForm($car);
	}

	private function carForm($car)
	{
		$freeDrivers = $this->find('Driver', ['car' => null, 'deleted' => false]);
		$groups = $this->find('CarGroup', ['deleted' => false]);

		return $this->render('admin/car.twig', [
			'car' => $car,
			'freeDrivers' => $freeDrivers,
			'groups' => $groups
		]);
	}

	function saveCar($car, Request $req)
	{
		$gid = $req->request->get('group-id');
		$group = $this->getDoctrine()->getRepository('AppBundle:CarGroup')->find($gid);
		
		$driver_id = $req->request->get('driver-id');
		$driver = $this->getDoctrine()->getRepository('AppBundle:Driver')->find($driver_id);
		
		$car->setName($req->request->get('car-name'));
		$car->setClass($req->request->get('class'));
		$car->setColor($req->request->get('car-color'));
		$car->setPlate(strtoupper($req->request->get('car-plate')));
		$car->setBodyType($req->request->get('car-body_type'));
		$car->setGroup($group);
		$car->setDriver($driver);
	}

	/**
	 * @Route("/service/fares", name="faresList")
	 */
	function faresList()
	{
		$fares = $this->getDoctrine()->getRepository('AppBundle:Fare')->findBy(['deleted' => false]);
		return $this->render('admin/fares.html.twig', ['fares' => $fares]);
	}

	/**
	 * @Route("/service/fare/{id}", name="fare")
	 */
	function fare(Request $req, $id)
	{
		$fare = $this->getDoctrine()->getRepository('AppBundle:Fare')
			->findOneBy(['id' => $id, 'deleted' => false]);
		if (!$fare) {
			throw new NotFoundHttpException;
		}

		if ($req->isMethod('POST')) {
			$newFare = $this->createNewFare($req);
			$fare->setDeleted(true);
			$em = $this->db();
			$em->persist($newFare);
			$em->persist($fare);
			$em->flush();
			return $this->redirectToRoute('fare', ['id' => $newFare->getId()]);
		}
		return $this->render('admin/fare.twig', ['fare' => $fare]);
	}

	private function createNewFare(Request $req)
	{
		/*
		 * Order records will hold references to fares to save information
		 * about which fare was used for a particular order. If we just
		 * update the fare record, the information for older records will
		 * become wrong. That's why we don't update fares but create a new
		 * record and mark the previous one as deleted.
		 */
		$p = $req->request;
		$fare = new \AppBundle\Entity\Fare();
		$fare->setName($p->get('name'));
		$fare->setStartPrice($p->get('start_price'));
		$fare->setMinPrice($p->get('minimal_price'));
		$fare->setHourPrice($p->get('slow_hour_price'));
		$fare->setKmPrice($p->get('kilometer_price'));
		return $fare;
	}

	private function delete_fare()
	{
		$fare_id = argv(1);

		return fares::delete_fare($fare_id);
	}
}
