<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_customers")
 */
class Customer
{

	/**
	 * @ORM\Column(type="integer", name="customer_id")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=200)
	 */
	private $name;

	/**
	 * @ORM\Column(type="string", length=20, unique=TRUE)
	 */
	private $phone;

	/**
	 * @ORM\OneToMany(targetEntity="Order", mappedBy="customer")
	 */
	private $orders;

	/**
	 * Get id
	 *
	 * @return integer
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Set name
	 *
	 * @param string $name
	 *
	 * @return Customer
	 */
	public function setName($name)
	{
		$this->name = $name;

		return $this;
	}

	/**
	 * Get name
	 *
	 * @return string
	 */
	public function getName()
	{
		return $this->name;
	}

	/**
	 * Set phone
	 *
	 * @param string $phone
	 *
	 * @return Customer
	 */
	public function setPhone($phone)
	{
		$this->phone = $phone;

		return $this;
	}

	/**
	 * Get phone
	 *
	 * @return string
	 */
	public function getPhone()
	{
		return $this->phone;
	}

	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->orders = new \Doctrine\Common\Collections\ArrayCollection();
	}

	/**
	 * Add order
	 *
	 * @param \AppBundle\Entity\Order $order
	 *
	 * @return Customer
	 */
	public function addOrder(\AppBundle\Entity\Order $order)
	{
		$this->orders[] = $order;

		return $this;
	}

	/**
	 * Remove order
	 *
	 * @param \AppBundle\Entity\Order $order
	 */
	public function removeOrder(\AppBundle\Entity\Order $order)
	{
		$this->orders->removeElement($order);
	}

	/**
	 * Get orders
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getOrders()
	{
		return $this->orders;
	}

}
