<?php
/*
 * Allows declaring event types, adding listeners and triggering them.
 */

/*
 * Register an event type to enable adding and calling listeners.
 */
function register_event_type( $type ) {
	return events::register_event_type( $type );
}

/*
 * Add a listener for the given type of events.
 */
function listen_events( $type, $func ) {
	events::add_listener( $type, $func );
}

/*
 * Call listeners registered for the given type of event.
 */
function announce_event( $type, $data = null ) {
	return events::announce( $type, $data );
}

function info_events() {
	return events::info();
}


/*
 * Internal event listener representation.
 */
class event_listener
{
	/*
	 * Function to call.
	 */
	public $func;

	function __construct( $func ) {
		$this->func = $func;
	}
}

class event
{
	public $type;
	public $data;

	function __construct( $type, $data = null ) {
		$this->type = $type;
		$this->data = $data;
	}

	function __toString() {
		return "event '$this->type'";
	}
}

class events
{
	/*
	 * event_type => listeners[]
	 */
	private static $listeners = array();

	/*
	 * Register an event type for later use. This enforces event
	 * declarations in modules and helps avoid event conflicts.
	 */
	static function register_event_type( $type )
	{
		if( isset( self::$listeners[$type] ) ) {
			error( "Event type '$type' is already registered." );
			return;
		}

		self::$listeners[$type] = array();
	}

	/*
	 * Add a function to be called when an event of the given type is
	 * announced.
	 */
	static function add_listener( $type, $func )
	{
		if( !is_callable( $func ) ) {
			error( "$func is not callable" );
			return false;
		}
		if( !isset( self::$listeners[$type] ) ) {
			error( "Unregistered event type: $type" );
			return false;
		}
		$l = new event_listener( $func );
		self::$listeners[$type][] = $l;
	}

	/*
	 * Announce an event calling all functions registered for the given
	 * type of event. $data will be passed to the listeners as a
	 * parameter.
	 */
	static function announce( $type, $data )
	{
		if( !isset( self::$listeners[$type] ) ) {
			warning( "Announcing unregistered event '$type'" );
			return false;
		}

		$event = new event( $type, $data );

		foreach( self::$listeners[$type] as $l ) {
			call_user_func( $l->func, $event );
		}
		return true;
	}

	static function info()
	{
		$a = array();
		foreach( self::$listeners as $name => $L )
		{
			foreach( $L as $l )
			{
				$a[] = array(
					'event' => $name,
					'func' => $l->func
				);
			}
		}
		return $a;
	}

}
?>
