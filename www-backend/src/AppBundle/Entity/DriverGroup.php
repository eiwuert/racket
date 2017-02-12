<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_driver_groups")
 */
class DriverGroup
{
	/**
	 * @ORM\Column(type="integer", name="group_id")
	 * @ORM\Id @ORM\GeneratedValue
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=200)
	 */
	private $name;

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
	 * @return DriverGroup
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
