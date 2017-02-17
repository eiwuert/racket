<?php
/*
 * An RPC link with the newer server.
 */
define('T_S2', 's2');

add_auth_func(function($cid, $str) {
	if( strpos( $cid, '127.0.0.1' ) !== 0 ) {
		return null;
	}

	$m = message::parse_from_json($str);
	if( !$m || $m->command != 'auth-s2' ) {
		return null;
	}

	write_message($cid, new message('auth-ok'));
	return new conn_user(T_S2, 0);
});

add_cmdfunc(T_S2, 'auth-s2', function() {
	// nothing
});
add_cmdfunc(T_S2, 'ping', function() {
	// nothing
});

function find_users() {
	$conns = [];
	$R = conn::find_users(T_S2);
	foreach( $R as $r ) {
		$conns[] = $r->cid;
	}
	return $conns;
}

function s2_send($name, $data)
{
	$conns = find_users();
	$n = count($conns);

	if($n == 0) {
		trigger_error("Can't broadcast: no S2 connection");
		return false;
	}

	if($n > 1) {
		trigger_error("More than one S2 connection");
		return false;
	}

	$bmsg = new message($name, $data);
	return write_message($conns[0], $bmsg);
}

?>
