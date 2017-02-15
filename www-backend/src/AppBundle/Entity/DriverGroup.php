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
	 * @ORM\Column(type="boolean")
	 */
	private $deleted = false;

	/**
	 * @ORM\OneToMany(targetEntity="Driver", mappedBy="group")
	 */
	private $drivers;

	/**
	 * @ORM\ManyToMany(targetEntity="Queue", inversedBy="driverGroups")
	 * @ORM\JoinTable(name="taxi_driver_group_queues",
	 * 	joinColumns={
	 * 		@ORM\JoinColumn(name="group_id", referencedColumnName="group_id")
	 * 	},
	 * 	inverseJoinColumns={
	 * 		@ORM\JoinColumn(name="queue_id", referencedColumnName="queue_id")
	 * 	}
	 * )
	 */
	private $queues;

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

	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->drivers = new \Doctrine\Common\Collections\ArrayCollection();
	}

	/**
	 * Add driver
	 *
	 * @param \AppBundle\Entity\Driver $driver
	 *
	 * @return DriverGroup
	 */
	public function addDriver(\AppBundle\Entity\Driver $driver)
	{
		$this->drivers[] = $driver;

		return $this;
	}

	/**
	 * Remove driver
	 *
	 * @param \AppBundle\Entity\Driver $driver
	 */
	public function removeDriver(\AppBundle\Entity\Driver $driver)
	{
		$this->drivers->removeElement($driver);
	}

	/**
	 * Get drivers
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getDrivers()
	{
		return $this->drivers;
	}

	/**
	 * Add queue
	 *
	 * @param \AppBundle\Entity\Queue $queue
	 *
	 * @return DriverGroup
	 */
	public function addQueue(\AppBundle\Entity\Queue $queue)
	{
		$this->queues[] = $queue;

		return $this;
	}

	/**
	 * Remove queue
	 *
	 * @param \AppBundle\Entity\Queue $queue
	 */
	public function removeQueue(\AppBundle\Entity\Queue $queue)
	{
		$this->queues->removeElement($queue);
	}

	/**
	 * Get queues
	 *
	 * @return \Doctrine\Common\Collections\Collection
	 */
	public function getQueues()
	{
		return $this->queues;
	}

	/**
	 * Set deleted
	 *
	 * @param boolean $deleted
	 *
	 * @return DriverGroup
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
