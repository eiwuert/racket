<?php

function info_cmdfunc() {
	return mdispatch::info();
}

function add_cmdfunc( $ctype, $command, $func ) {
	mdispatch::add_func( $ctype, $command, $func, false );
}

function add_cmdfunc_first( $ctype, $command, $func ) {
	mdispatch::add_func( $ctype, $command, $func, true );
}


class mdispatch
{
	/*
	 * client type => message name => priority => { func }[]
	 */
	private static $F = array();

	static function add_func( $utype, $cmd, $func, $first = false )
	{
		if( !is_callable( $func ) ) {
			error( "Function '$func' is not callable" );
			exit;
		}

		if( !isset( self::$F[$utype] ) ) {
			self::$F[$utype] = array();
		}
		if( !isset( self::$F[$utype][$cmd] ) ) {
			self::$F[$utype][$cmd] = array( array(), array() );
		}

		$i = $first ? 0 : 1;
		self::$F[$utype][$cmd][$i][] = array( 'f' => $func );
	}

	static function info()
	{
		$a = array();
		foreach( self::$F as $type => $C )
		{
			foreach( $C as $cmd => $pbucket )
			{
				foreach( $pbucket as $i => $F )
				{
					foreach( $F as $rec ) {
						$a[] = array(
							'type' => $type,
							'cmd' => $cmd,
							'func' => $rec['f'],
							'first' => !$i ? 'yes' : '.'
						);
					}
				}
			}
		}
		return $a;
	}

	private static function run( $F, $msg, $user )
	{
		foreach( $F as $a )
		{
			$f = $a['f'];
			/*
			 * If the function explicitly returns false, we have to
			 * stop.
			 */
			if( call_user_func( $f, $msg, $user ) === false ) {
				debmsg( "Function '$f' terminated command '$msg->command'" );
				return false;
			}
		}
		return true;
	}

	static function dispatch( $message, $client )
	{
		debmsg( "in: $message ($message->cid)" );
		$cmd = $message->command;
		$user = $client->user;
		$t = $user->type;

		if( !isset( self::$F[$t][$cmd] ) ) {
			warning( "No functions for '$t/$cmd'" );
			return;
		}

		if( isset( self::$F[$t]['*'][0] ) )
		{
			$F = self::$F[$t]['*'][0];
			if( self::run( $F, $message, $user ) === false ) {
				return;
			}
		}

		$F = self::$F[$t][$cmd][0];
		if( self::run( $F, $message, $user ) === false ) {
			return;
		}

		$F = self::$F[$t][$cmd][1];
		if( self::run( $F, $message, $user ) === false ) {
			return;
		}
	}
}
?>
