<?php
require 'server/lib/mysql.php';
require 'server/lib/bcrypt.php';

// Database access
$host = 'localhost';
$user = 'root';
$pass = 'root';
$dbname = 'taxi';

$admin_login = 'admin';
$admin_password = 'admin';

$db = new mysql($host, $user, $pass, $dbname);

// Create admin account
$db->insertRecord( 'taxi_accounts', array(
	'type' => 'admin',
	'login' => $admin_login,
	'password_hash' => bcrypt( $admin_password )
));

?>
