<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_logs")
 */
class ServiceMessage
{
	/**
	 * @ORM\Column(type="integer", name="message_id")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @ORM\Column(type="datetime", name="t")
	 * @var type DateTime
	 */
	private $datetime;

	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $text;

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
	 * Set datetime
	 *
	 * @param \DateTime $datetime
	 *
	 * @return ServiceMessage
	 */
	public function setDatetime($datetime)
	{
		$this->datetime = $datetime;

		return $this;
	}

	/**
	 * Get datetime
	 *
	 * @return \DateTime
	 */
	public function getDatetime()
	{
		return $this->datetime;
	}

	/**
	 * Set text
	 *
	 * @param string $text
	 *
	 * @return ServiceMessage
	 */
	public function setText($text)
	{
		$this->text = $text;

		return $this;
	}

	/**
	 * Get text
	 *
	 * @return string
	 */
	public function getText()
	{
		return $this->text;
	}
}
