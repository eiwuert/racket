<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_cars")
 */
class Car
{
	/**
	 * @ORM\Column(name="car_id")
	 * @ORM\Id @ORM\GeneratedValue
	 * @var type integer
	 */
	private $id;
	
	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $name;
	
	/**
	 * @ORM\Column
	 */
	private $plate;
	
	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $color;
	
	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $class;
	
	/**
	 * @ORM\Column(name="body_type")
	 * @var type string
	 */
	private $bodyType;
	
	/**
	 * @ORM\Column(type="boolean")
	 * @var type bool
	 */
	private $deleted = false;
	
	/**
	 * @ORM\ManyToOne(targetEntity="CarGroup", inversedBy="cars")
	 * @ORM\JoinColumn(name="group_id", referencedColumnName="group_id")
	 */
	private $group;
	
	/**
	 * @ORM\OneToOne(targetEntity="Driver", mappedBy="car")
	 */
	private $driver;

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
     * @return Car
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
     * Set plate
     *
     * @param string $plate
     *
     * @return Car
     */
    public function setPlate($plate)
    {
        $this->plate = $plate;

        return $this;
    }

    /**
     * Get plate
     *
     * @return string
     */
    public function getPlate()
    {
        return $this->plate;
    }

    /**
     * Set group
     *
     * @param \AppBundle\Entity\CarGroup $group
     *
     * @return Car
     */
    public function setGroup(\AppBundle\Entity\CarGroup $group = null)
    {
        $this->group = $group;

        return $this;
    }

    /**
     * Get group
     *
     * @return \AppBundle\Entity\CarGroup
     */
    public function getGroup()
    {
        return $this->group;
    }

    /**
     * Set driver
     *
     * @param \AppBundle\Entity\Driver $driver
     *
     * @return Car
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
     * Set color
     *
     * @param string $color
     *
     * @return Car
     */
    public function setColor($color)
    {
        $this->color = $color;

        return $this;
    }

    /**
     * Get color
     *
     * @return string
     */
    public function getColor()
    {
        return $this->color;
    }

    /**
     * Set class
     *
     * @param string $class
     *
     * @return Car
     */
    public function setClass($class)
    {
        $this->class = $class;

        return $this;
    }

    /**
     * Get class
     *
     * @return string
     */
    public function getClass()
    {
        return $this->class;
    }

    /**
     * Set bodyType
     *
     * @param string $bodyType
     *
     * @return Car
     */
    public function setBodyType($bodyType)
    {
        $this->bodyType = $bodyType;

        return $this;
    }

    /**
     * Get bodyType
     *
     * @return string
     */
    public function getBodyType()
    {
        return $this->bodyType;
    }

    /**
     * Set deleted
     *
     * @param boolean $deleted
     *
     * @return Car
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
}
