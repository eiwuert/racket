<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_queues")
 */
class Queue
{
	/**
	 * @ORM\Column(name="queue_id")
	 * @ORM\Id @ORM\GeneratedValue
	 */
	private $id;

	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $name;
	
	/**
	 * @ORM\Column(type="boolean")
	 */
	private $deleted = false;
	
	/**
	 * @ORM\ManyToMany(targetEntity="DriverGroup", mappedBy="queues")
	 */
	private $driverGroups;
	
	/**
	 * @ORM\Column(type="float")
	 * @var type float
	 */
	private $latitude;
	
	/**
	 * @ORM\Column(type="float")
	 * @var type float
	 */
	private $longitude;
	
	/**
	 * @ORM\Column(type="integer")
	 * @var type int
	 */
	private $radius;

	/**
	 * @ORM\OneToOne(targetEntity="Location", inversedBy="queue")
	 * @ORM\JoinColumn(name="loc_id", referencedColumnName="loc_id")
	 */
	private $location;
	
	/**
	 * @ORM\Column(name="`order`")
	 * @var type int
	 */
	private $order;
	
	/**
	 * @ORM\Column(name="addr")
	 * @var type string
	 */
	private $address;

    /**
     * Get id
     *
     * @return string
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
     * @return Queue
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
     * Constructor
     */
    public function __construct()
    {
        $this->driverGroups = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add driverGroup
     *
     * @param \AppBundle\Entity\DriverGroup $driverGroup
     *
     * @return Queue
     */
    public function addDriverGroup(\AppBundle\Entity\DriverGroup $driverGroup)
    {
        $this->driverGroups[] = $driverGroup;

        return $this;
    }

    /**
     * Remove driverGroup
     *
     * @param \AppBundle\Entity\DriverGroup $driverGroup
     */
    public function removeDriverGroup(\AppBundle\Entity\DriverGroup $driverGroup)
    {
        $this->driverGroups->removeElement($driverGroup);
    }

    /**
     * Get driverGroups
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getDriverGroups()
    {
        return $this->driverGroups;
    }

    /**
     * Set location
     *
     * @param \AppBundle\Entity\Location $location
     *
     * @return Queue
     */
    public function setLocation(\AppBundle\Entity\Location $location = null)
    {
        $this->location = $location;

        return $this;
    }

    /**
     * Get location
     *
     * @return \AppBundle\Entity\Location
     */
    public function getLocation()
    {
        return $this->location;
    }

    /**
     * Set order
     *
     * @param string $order
     *
     * @return Queue
     */
    public function setOrder($order)
    {
        $this->order = $order;

        return $this;
    }

    /**
     * Get order
     *
     * @return string
     */
    public function getOrder()
    {
        return $this->order;
    }

    /**
     * Set address
     *
     * @param string $address
     *
     * @return Queue
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
     * Set deleted
     *
     * @param boolean $deleted
     *
     * @return Queue
     */
    public function setDeleted($deleted)
    {
        $this->deleted = $deleted;

        return $this;
    }

    /**
     * Get deleted
     *
     * @return boolean
     */
    public function getDeleted()
    {
        return $this->deleted;
    }

    /**
     * Set latitude
     *
     * @param float $latitude
     *
     * @return Queue
     */
    public function setLatitude($latitude)
    {
        $this->latitude = $latitude;

        return $this;
    }

    /**
     * Get latitude
     *
     * @return float
     */
    public function getLatitude()
    {
        return $this->latitude;
    }


    /**
     * Get longiude
     *
     * @return float
     */
    public function getLongitude()
    {
        return $this->longitude;
    }

    /**
     * Set radius
     *
     * @param integer $radius
     *
     * @return Queue
     */
    public function setRadius($radius)
    {
        $this->radius = $radius;

        return $this;
    }

    /**
     * Get radius
     *
     * @return integer
     */
    public function getRadius()
    {
        return $this->radius;
    }

    /**
     * Set longitude
     *
     * @param float $longitude
     *
     * @return Queue
     */
    public function setLongitude($longitude)
    {
        $this->longitude = $longitude;

        return $this;
    }
}
