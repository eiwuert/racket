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
	
	private $latitude;
	private $longitude;

	private $address;
}
