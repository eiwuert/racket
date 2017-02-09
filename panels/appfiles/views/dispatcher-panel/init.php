<?php

if( user::get_type() != 'dispatcher' && argv(0) != 'login' ) {
	redirect( url_t( 'login' ) );
}
?>
