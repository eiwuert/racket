<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_car_groups")
 */
class CarGroup
{
	/**
	 * @ORM\Column(type="integer", name="group_id")
	 * @ORM\Id @ORM\GeneratedValue
	 */
	private $id;

	/**
	 * @ORM\Column(type="string")
	 */
	private $name;

	/**
	 * @ORM\Column(type="boolean")
	 * @var bool
	 */
	private $deleted = false;

	/**
	 * @ORM\OneToMany(targetEntity="Car", mappedBy="group")
	 */
	private $cars;

	/**
	 * @ORM\ManyToMany(targetEntity="Fare", inversedBy="carGroups")
	 * @ORM\JoinTable(name="taxi_car_group_fares",
	 * 	joinColumns={
	 * 		@ORM\JoinColumn(name="group_id", referencedColumnName="group_id")
	 * 	},
	 * 	inverseJoinColumns={
	 * 		@ORM\JoinColumn(name="fare_id", referencedColumnName="fare_id")
	 * 	}
	 * )
	 */
	private $fares;

	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->cars = new \Doctrine\Common\Collections\ArrayCollection();
		$this->fares = new \Doctrine\Common\Collections\ArrayCollection();
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
	 * Set name
	 *
	 * @param string $name
	 *
	 * @return CarGroup
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
	 * Add car
	 *
	 * @param \AppBundle\Entity\Car $car
	 *
	 * @return CarGroup
	 */
	public function addCar(\AppBundle\Entity\Car $car)
	{
		$this->cars[] = $car;

		return $this;
	}

	/**
	 * Remove car
	 *
	 * @param \AppBundle\Entity\Car $car
	 */
	public function removeCar(\AppBundle\Entity\Car $car)
	{
		$this->cars->removeElement($car);
	}

	/**
	 * Get cars
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getCars()
	{
		return $this->cars;
	}

	/**
	 * Add fare
	 *
	 * @param \AppBundle\Entity\Fare $fare
	 *
	 * @return CarGroup
	 */
	public function addFare(\AppBundle\Entity\Fare $fare)
	{
		$this->fares[] = $fare;

		return $this;
	}

	/**
	 * Remove fare
	 *
	 * @param \AppBundle\Entity\Fare $fare
	 */
	public function removeFare(\AppBundle\Entity\Fare $fare)
	{
		$this->fares->removeElement($fare);
	}

	/**
	 * Get fares
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getFares()
	{
		return $this->fares;
	}

	/**
	 * Set deleted
	 *
	 * @param boolean $deleted
	 *
	 * @return CarGroup
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
