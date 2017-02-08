<?php

/*
 * Right now we need the two frameworks to coexist.
 * Rather than mess with Apache's mod_rewrite,
 * dispatch the requests from here.
 */

if(strpos($_SERVER['REQUEST_URI'], '/sym/') === 0) {
	require 'app.php';
}
else {
	require 'hall.php';
}

?>
