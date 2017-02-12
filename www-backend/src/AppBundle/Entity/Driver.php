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
	 * @ORM\OneToOne(targetEntity="Account")
	 * @ORM\JoinColumn(name="acc_id", referencedColumnName="acc_id")
	 */
	private $account;

	/**
	 * @ORM\ManyToOne(targetEntity="DriverGroup")
	 * @ORM\JoinColumn(name="group_id", referencedColumnName="group_id")
	 */
	private $group;

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
}
