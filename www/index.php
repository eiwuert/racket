<?php

/*
 * Right now we need the two frameworks to coexist.
 * Rather than mess with Apache's mod_rewrite,
 * dispatch the requests from here.
 */

function serve_sym()
{
	$sym = [
		'/sym/',
		'/dx/dispatcher/',
		'/_wdt/',
		'/_profiler/',
		'/dispatcher',
		'/service',
		'/json'
	];

	$url = $_SERVER['REQUEST_URI'];
	if (substr($url, -1) != '/') {
		$url .= '/';
	}

	foreach ($sym as $pref) {
		if (strpos($url, $pref) === 0) {
			require 'app.php';
			return true;
		}
	}
	return false;
}

if (!serve_sym()) {
	require 'hall.php';
}
?>
