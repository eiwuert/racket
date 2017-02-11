<?php
namespace AppBundle;
/*
 * Dispatcher protocol client.
 */
class dispatcher_client extends server_client
{
	private $err = null;

	function login( $id )
	{
		$this->send_message( 'auth-dispatcher', array(
			'id' => $id
		));
		return $this->check_error();
	}

	function cmd( $cmd, $data )
	{
		$bytes = $this->send_message( $cmd, $data );
		if( !$bytes ) {
			$this->err = "Could not write data to the server";
			return false;
		}
		return $this->check_error();
	}

	function send_text( $taxi_id, $message )
	{
		return $this->cmd( "send-text", array(
			'driver_id' => $taxi_id,
			'text' => $message
		));
	}

	function check_error()
	{
		$m = $this->receive_message();
		if( !$m ) {
			$this->err = "No reply from the server";
			return false;
		}
		if( $m['command'] != "result" ) {
			$this->err = "Wrong reply message";
			return false;
		}
		$this->err = $m["data"]["errstr"];
		return $this->err == null;
	}

	function error() {
		return $this->err;
	}
}
?>
