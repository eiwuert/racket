<?php
/*
 * Authorisation result
 */
class conn_user
{
	public $type;
	public $id;
	public $login;

	function __construct( $type, $id )
	{
		$this->type = $type;
		$this->id = $id;
	}

	/*
	 * Arbitrary data storage to make living in the single-threaded
	 * world easier.
	 */
	private $data = array();
	function data( $k, $v = null ) {
		if( $v === null ) {
			return array_alt( $this->data, $k, null );
		}
		else {
			$this->data[$k] = $v;
		}
	}

	function __toString() {
		return '{'."$this->type, #$this->id}";
	}
}
?>
