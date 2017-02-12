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
}
