<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_orders")
 */
class Order
{

	/**
	 * @ORM\Id
	 * @ORM\Column(name="order_id", type="integer")
	 * @var type integer
	 */
	private $id;

	/**
	 * @ORM\Column(name="order_uid", type="integer")
	 * @var type string
	 */
	private $uid;

	/**
	 * @ORM\Column(name="comments")
	 * @var type string
	 */
	private $comments;

	/**
	 * @ORM\Column
	 */
	private $status;

	/**
	 * @ORM\Column(name="time_created", type="datetime")
	 */
	private $timeCreated;
	
	/**
	 * @ORM\Column(name="src_addr")
	 * @var type string
	 */
	private $address;

	/**
	 * @ORM\OneToOne(targetEntity="Account")
	 * @ORM\JoinColumn(name="owner_id", referencedColumnName="acc_id")
	 */
	private $creator;

	/**
	 * @ORM\ManyToOne(targetEntity="Customer", inversedBy="orders")
	 * @ORM\JoinColumn(name="customer_id", referencedColumnName="customer_id")
	 */
	private $customer;

	/**
	 * @ORM\OneToOne(targetEntity="Driver")
	 * @ORM\JoinColumn(name="taxi_id", referencedColumnName="driver_id")
	 */
	private $driver;

	/**
	 * @ORM\OneToOne(targetEntity="Car")
	 * @ORM\JoinColumn(name="car_id", referencedColumnName="car_id")
	 */
	private $car;

}
