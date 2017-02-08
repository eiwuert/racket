<?php

function logmsg( $msg, $acc_id = null )
{
	debmsg( $msg );

	$ref = "";
	if( $acc_id ) $ref .= "#$acc_id";

	out( "$ref	$msg" );
}

?>
