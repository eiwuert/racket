<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_fares")
 */
class Fare
{
	/**
	 * @ORM\Column(type="integer", name="fare_id")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string")
	 */
	private $name;

	/**
	 * @ORM\Column(type="integer")
	 * @var type int
	 */
	private $startPrice;

	/**
	 * @ORM\Column(type="integer", name="minimal_price")
	 * @var type int
	 */
	private $minPrice;

	/**
	 * @ORM\Column(type="integer", name="kilometer_price")
	 * @var type int
	 */
	private $kmPrice;

	/**
	 * @ORM\Column(type="integer", name="slow_hour_price")
	 * @var type int
	 */
	private $hourPrice;
	
	/**
	 * @ORM\Column(type="boolean")
	 */
	private $deleted = false;

	/**
	 * @ORM\ManyToMany(targetEntity="CarGroup", mappedBy="fares")
	 */
	private $carGroups;

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
	 * @return Fare
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
	 * Set startPrice
	 *
	 * @param integer $startPrice
	 *
	 * @return Fare
	 */
	public function setStartPrice($startPrice)
	{
		$this->startPrice = $startPrice;

		return $this;
	}

	/**
	 * Get startPrice
	 *
	 * @return integer
	 */
	public function getStartPrice()
	{
		return $this->startPrice;
	}

	/**
	 * Set minPrice
	 *
	 * @param integer $minPrice
	 *
	 * @return Fare
	 */
	public function setMinPrice($minPrice)
	{
		$this->minPrice = $minPrice;

		return $this;
	}

	/**
	 * Get minPrice
	 *
	 * @return integer
	 */
	public function getMinPrice()
	{
		return $this->minPrice;
	}

	/**
	 * Set kmPrice
	 *
	 * @param integer $kmPrice
	 *
	 * @return Fare
	 */
	public function setKmPrice($kmPrice)
	{
		$this->kmPrice = $kmPrice;

		return $this;
	}

	/**
	 * Get kmPrice
	 *
	 * @return integer
	 */
	public function getKmPrice()
	{
		return $this->kmPrice;
	}

	/**
	 * Set hourPrice
	 *
	 * @param integer $hourPrice
	 *
	 * @return Fare
	 */
	public function setHourPrice($hourPrice)
	{
		$this->hourPrice = $hourPrice;

		return $this;
	}

	/**
	 * Get hourPrice
	 *
	 * @return integer
	 */
	public function getHourPrice()
	{
		return $this->hourPrice;
	}
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->carGroups = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add carGroup
     *
     * @param \AppBundle\Entity\CarGroup $carGroup
     *
     * @return Fare
     */
    public function addCarGroup(\AppBundle\Entity\CarGroup $carGroup)
    {
        $this->carGroups[] = $carGroup;

        return $this;
    }

    /**
     * Remove carGroup
     *
     * @param \AppBundle\Entity\CarGroup $carGroup
     */
    public function removeCarGroup(\AppBundle\Entity\CarGroup $carGroup)
    {
        $this->carGroups->removeElement($carGroup);
    }

    /**
     * Get carGroups
     *
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCarGroups()
    {
        return $this->carGroups;
    }

    /**
     * Set deleted
     *
     * @param boolean $deleted
     *
     * @return Fare
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
