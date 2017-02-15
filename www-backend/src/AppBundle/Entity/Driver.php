<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_drivers")
 */
class Driver
{

	/**
	 * @ORM\Column(type="integer", name="driver_id")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=200)
	 */
	private $clientVersion;

	/**
	 * @ORM\Column(type="boolean")
	 */
	private $isFake = false;

	/**
	 * @ORM\Column(type="boolean")
	 */
	private $deleted = false;

	/**
	 * @ORM\Column(name="is_brig", type="boolean")
	 */
	private $isBrig = false;

	/**
	 * @ORM\OneToOne(targetEntity="Account")
	 * @ORM\JoinColumn(name="acc_id", referencedColumnName="acc_id")
	 */
	private $account;

	/**
	 * @ORM\ManyToOne(targetEntity="DriverGroup", inversedBy="drivers")
	 * @ORM\JoinColumn(name="group_id", referencedColumnName="group_id")
	 */
	private $group;

	/**
	 * @ORM\OneToOne(targetEntity="Car", inversedBy="driver")
	 * @ORM\JoinColumn(name="car_id", referencedColumnName="car_id")
	 */
	private $car;

	/**
	 * @ORM\Column(name="block_until", type="datetime")
	 * @var type DateTime
	 */
	private $blockUntil;

	/**
	 * @ORM\Column(name="block_reason")
	 * @var type string
	 */
	private $blockReason;

	function isBlocked()
	{
		return $this->getBlockUntil()->getTimestamp() > time();
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
	 * Set clientVersion
	 *
	 * @param string $clientVersion
	 *
	 * @return Driver
	 */
	public function setClientVersion($clientVersion)
	{
		$this->clientVersion = $clientVersion;

		return $this;
	}

	/**
	 * Get clientVersion
	 *
	 * @return string
	 */
	public function getClientVersion()
	{
		return $this->clientVersion;
	}

	/**
	 * Set group
	 *
	 * @param \AppBundle\Entity\DriverGroup $group
	 *
	 * @return Driver
	 */
	public function setGroup(\AppBundle\Entity\DriverGroup $group = null)
	{
		$this->group = $group;

		return $this;
	}

	/**
	 * Get group
	 *
	 * @return \AppBundle\Entity\DriverGroup
	 */
	public function getGroup()
	{
		return $this->group;
	}

	/**
	 * Set account
	 *
	 * @param \AppBundle\Entity\Account $account
	 *
	 * @return Driver
	 */
	public function setAccount(\AppBundle\Entity\Account $account = null)
	{
		$this->account = $account;

		return $this;
	}

	/**
	 * Get account
	 *
	 * @return \AppBundle\Entity\Account
	 */
	public function getAccount()
	{
		return $this->account;
	}

	/**
	 * Set car
	 *
	 * @param \AppBundle\Entity\Car $car
	 *
	 * @return Driver
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

	/**
	 * Set blockUntil
	 *
	 * @param \DateTime $blockUntil
	 *
	 * @return Driver
	 */
	public function setBlockUntil($blockUntil)
	{
		$this->blockUntil = $blockUntil;

		return $this;
	}

	/**
	 * Get blockUntil
	 *
	 * @return \DateTime
	 */
	public function getBlockUntil()
	{
		return $this->blockUntil;
	}

	/**
	 * Set blockReason
	 *
	 * @param string $blockReason
	 *
	 * @return Driver
	 */
	public function setBlockReason($blockReason)
	{
		$this->blockReason = $blockReason;

		return $this;
	}

	/**
	 * Get blockReason
	 *
	 * @return string
	 */
	public function getBlockReason()
	{
		return $this->blockReason;
	}

	/**
	 * Set deleted
	 *
	 * @param boolean $deleted
	 *
	 * @return Driver
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
	 * Set isFake
	 *
	 * @param boolean $isFake
	 *
	 * @return Driver
	 */
	public function setIsFake($isFake)
	{
		$this->isFake = $isFake;

		return $this;
	}

	/**
	 * Get isFake
	 *
	 * @return boolean
	 */
	public function getIsFake()
	{
		return $this->isFake;
	}

	/**
	 * Set isBrig
	 *
	 * @param boolean $isBrig
	 *
	 * @return Driver
	 */
	public function setIsBrig($isBrig)
	{
		$this->isBrig = $isBrig;

		return $this;
	}

	/**
	 * Get isBrig
	 *
	 * @return boolean
	 */
	public function getIsBrig()
	{
		return $this->isBrig;
	}

}
