import {tpl} from '../../lib/fmt.js';
import html from '../../lib/html.js';

export default function DriverSection( $container )
{
	var s = '<select class="driver"><option value="0">Выбрать автоматически</option>';
	disp.drivers().forEach( function( d ) {
		s += tpl( '<option value="?">? - ?</option>',
			d.id, d.call_id, d.surname() );
	});
	s += '</select>';
	var $select = $( s );

	$container.append( '<label>Водитель</label>' );
	$container.append( $select );

	this.onChange = function( f ) { $select.on( 'change', f ); };
	this.get = function() {
		var id = $select.val();
		if( id != "" ) {
			id = parseInt( id, 10 );
		}
		return id;
	};
	this.set = function( id ) {
		$select.val( id );
	};
}
