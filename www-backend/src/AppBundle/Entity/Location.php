<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_locations")
 */
class Location
{

	/**
	 * @ORM\Column(name="loc_id")
	 * @ORM\Id @ORM\GeneratedValue
	 */
	private $id;

	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $name;

	/**
	 * @ORM\Column(type="decimal", precision=9, scale=6)
	 */
	private $latitude;

	/**
	 * @ORM\Column(type="decimal", precision=9, scale=6)
	 */
	private $longitude;

	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $address;

	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $comments;

	/**
	 * @ORM\OneToOne(targetEntity="Queue", mappedBy="location")
	 * @var type Queue
	 */
	private $queue;

	/**
	 * @ORM\Column(name="contact_phone")
	 */
	private $contactPhone;

	/**
	 * @ORM\Column(type="boolean")
	 */
	private $deleted = false;

	function isSpecial()
	{
		return false;
	}

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
	 * @return Location
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
	 * Set address
	 *
	 * @param string $address
	 *
	 * @return Location
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
	 * Set contactPhone
	 *
	 * @param string $contactPhone
	 *
	 * @return Location
	 */
	public function setContactPhone($contactPhone)
	{
		$this->contactPhone = $contactPhone;

		return $this;
	}

	/**
	 * Get contactPhone
	 *
	 * @return string
	 */
	public function getContactPhone()
	{
		return $this->contactPhone;
	}

	/**
	 * Set comments
	 *
	 * @param string $comments
	 *
	 * @return Location
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
	 * Set queue
	 *
	 * @param \AppBundle\Entity\Queue $queue
	 *
	 * @return Location
	 */
	public function setQueue(\AppBundle\Entity\Queue $queue = null)
	{
		$this->queue = $queue;

		return $this;
	}

	/**
	 * Get queue
	 *
	 * @return \AppBundle\Entity\Queue
	 */
	public function getQueue()
	{
		return $this->queue;
	}

	/**
	 * Set deleted
	 *
	 * @param boolean $deleted
	 *
	 * @return Location
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
	 * @param string $latitude
	 *
	 * @return Location
	 */
	public function setLatitude($latitude)
	{
		$this->latitude = $latitude;

		return $this;
	}

	/**
	 * Get latitude
	 *
	 * @return string
	 */
	public function getLatitude()
	{
		return $this->latitude;
	}

	/**
	 * Set longitude
	 *
	 * @param string $longitude
	 *
	 * @return Location
	 */
	public function setLongitude($longitude)
	{
		$this->longitude = $longitude;

		return $this;
	}

	/**
	 * Get longitude
	 *
	 * @return string
	 */
	public function getLongitude()
	{
		return $this->longitude;
	}

}
