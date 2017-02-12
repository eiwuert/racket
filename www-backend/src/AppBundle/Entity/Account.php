<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_accounts")
 */
class Account
{
	/**
	 * @ORM\Column(type="integer", name="acc_id")
	 * @ORM\Id
	 * @ORM\GeneratedValue(strategy="AUTO")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=20)
	 */
	private $type;

	/**
	 * @ORM\Column(type="string", length=50)
	 */
	private $login;

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
	 * Set type
	 *
	 * @param string $type
	 *
	 * @return Account
	 */
	public function setType($type)
	{
		$this->type = $type;

		return $this;
	}

	/**
	 * Get type
	 *
	 * @return string
	 */
	public function getType()
	{
		return $this->type;
	}

	/**
	 * Set login
	 *
	 * @param string $login
	 *
	 * @return Account
	 */
	public function setLogin($login)
	{
		$this->login = $login;

		return $this;
	}

	/**
	 * Get login
	 *
	 * @return string
	 */
	public function getLogin()
	{
		return $this->login;
	}

}
