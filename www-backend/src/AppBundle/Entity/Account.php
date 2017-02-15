<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Serializable;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity
 * @ORM\Table(name="taxi_accounts")
 */
class Account implements UserInterface, Serializable
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
	 * @ORM\Column(type="string")
	 */
	private $passwordHash;

	/**
	 * @ORM\Column(name="call_id")
	 * @var type string
	 */
	private $callId;

	/**
	 * @ORM\Column
	 * @var type string
	 */
	private $name;

	/**
	 * @ORM\Column(type="boolean")
	 * @var type boolean
	 */
	private $deleted;

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

	/**
	 * Set callId
	 *
	 * @param string $callId
	 *
	 * @return Account
	 */
	public function setCallId($callId)
	{
		$this->callId = $callId;

		return $this;
	}

	/**
	 * Get callId
	 *
	 * @return string
	 */
	public function getCallId()
	{
		return $this->callId;
	}

	/**
	 * Set name
	 *
	 * @param string $name
	 *
	 * @return Account
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
	 * Set deleted
	 *
	 * @param boolean $deleted
	 *
	 * @return Account
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
	 * Sets new password
	 * @param string $password New password
	 */
	public function setPassword($password)
	{
		$this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
	}

	public function eraseCredentials()
	{
		//
	}

	public function getPassword()
	{
		return $this->passwordHash;
	}

	function checkPassword($password) {
		return password_verify($password, $this->passwordHash);
	}

	public function getRoles()
	{
		/*
		 * Symfony\Component\Security\Core\Authorization\Voter\RoleVoter
		 * expects role names to start with the 'ROLE_' prefix.
		 */
		return ['ROLE_'.strtoupper($this->getType())];
	}

	public function getSalt()
	{
		return null;
	}

	public function getUsername()
	{
		return $this->getLogin();
	}

	public function serialize()
	{
		return serialize([$this->id, $this->login, $this->passwordHash]);
	}

	public function unserialize($serialized)
	{
		list($this->id, $this->login, $this->passwordHash) = unserialize($serialized);
	}

}
