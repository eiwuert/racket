import {tpl} from '../../lib/fmt.js';
import html from '../../lib/html.js';

export default function OptionsSection( $container )
{
	var $s = $( '<div></div>' );
	var $class = $( html.select( "Тип автомобиля", {
		"ordinary": "Любой",
		"sedan": "Седан",
		"estate": "Универсал",
		"minivan": "Минивен"
	}) );
	var $vip = $( html.checkbox( "VIP" ) );
	var $term = $( html.checkbox( "Терминал" ) );
	$s.append( $class ).append( $vip ).append( $term );
	$container.append( $s );

	$class = $class.filter( "select" );

	this.get = function() {
		return {
			opt_car_class: $class.val(),
			opt_vip: $vip.is( ':checked' )? '1' : '0',
			opt_terminal: $term.is( ':checked' )? '1' : '0'
		};
	};

	this.set = function( order ) {
		$class.val( order.opt_car_class );
		$vip.prop( 'checked', order.opt_vip == '1' );
		$term.prop( 'checked', order.opt_terminal == '1' );
	};

	this.disable = function() {
		$class.val( "" );
		$vip.add( $term ).prop( "checked", false );
		$s.find( 'input, select' ).prop( "disabled", true );
		$s.slideUp( "fast" );
	};

	this.enable = function() {
		$s.find( 'input, select' ).prop( "disabled", false );
		$s.slideDown( "fast" );
	};
}
