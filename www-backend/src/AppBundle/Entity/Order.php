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


    /**
     * Set id
     *
     * @param integer $id
     *
     * @return Order
     */
    public function setId($id)
    {
        $this->id = $id;

        return $this;
    }

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
     * Set uid
     *
     * @param integer $uid
     *
     * @return Order
     */
    public function setUid($uid)
    {
        $this->uid = $uid;

        return $this;
    }

    /**
     * Get uid
     *
     * @return integer
     */
    public function getUid()
    {
        return $this->uid;
    }

    /**
     * Set comments
     *
     * @param string $comments
     *
     * @return Order
     */
    public function setComments($comments)
    {
        $this->comments = $comments;

        return $this;
    }

    /**
     * Get comments
     *
     * @return string
     */
    public function getComments()
    {
        return $this->comments;
    }

    /**
     * Set status
     *
     * @param string $status
     *
     * @return Order
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set timeCreated
     *
     * @param \DateTime $timeCreated
     *
     * @return Order
     */
    public function setTimeCreated($timeCreated)
    {
        $this->timeCreated = $timeCreated;

        return $this;
    }

    /**
     * Get timeCreated
     *
     * @return \DateTime
     */
    public function getTimeCreated()
    {
        return $this->timeCreated;
    }

    /**
     * Set address
     *
     * @param string $address
     *
     * @return Order
     */
    public function setAddress($address)
    {
        $this->address = $address;

        return $this;
    }

    /**
     * Get address
     *
     * @return string
     */
    public function getAddress()
    {
        return $this->address;
    }

    /**
     * Set creator
     *
     * @param \AppBundle\Entity\Account $creator
     *
     * @return Order
     */
    public function setCreator(\AppBundle\Entity\Account $creator = null)
    {
        $this->creator = $creator;

        return $this;
    }

    /**
     * Get creator
     *
     * @return \AppBundle\Entity\Account
     */
    public function getCreator()
    {
        return $this->creator;
    }

    /**
     * Set customer
     *
     * @param \AppBundle\Entity\Customer $customer
     *
     * @return Order
     */
    public function setCustomer(\AppBundle\Entity\Customer $customer = null)
    {
        $this->customer = $customer;

        return $this;
    }

    /**
     * Get customer
     *
     * @return \AppBundle\Entity\Customer
     */
    public function getCustomer()
    {
        return $this->customer;
    }

    /**
     * Set driver
     *
     * @param \AppBundle\Entity\Driver $driver
     *
     * @return Order
     */
    public function setDriver(\AppBundle\Entity\Driver $driver = null)
    {
        $this->driver = $driver;

        return $this;
    }

    /**
     * Get driver
     *
     * @return \AppBundle\Entity\Driver
     */
    public function getDriver()
    {
        return $this->driver;
    }

    /**
     * Set car
     *
     * @param \AppBundle\Entity\Car $car
     *
     * @return Order
     */
    public function setCar(\AppBundle\Entity\Car $car = null)
    {
        $this->car = $car;

        return $this;
    }

    /**
     * Get car
     *
     * @return \AppBundle\Entity\Car
     */
    public function getCar()
    {
        return $this->car;
    }
}
