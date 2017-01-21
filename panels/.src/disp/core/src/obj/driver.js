import {assertObj} from '../../lib/assert.js';
import time from '../time.js';

export default function Driver( data )
{
	var spec = {
		"driver_id": "int",
		"call_id": "str",
		"name": "str",
		"phone": "str",
		"car_id": "int?",
		"group_id": "int",
		"type_id": "int?",
		"is_fake": "int",
		"has_bank_terminal": "int",
		"is_online": "int",
		"block_until": "int",
		"block_reason": "str",
		"latitude": "flt",
		"longitude": "flt",
		"is_busy": "int"
	};
	assertObj( data, spec );
	for( var k in spec ) {
		this[k] = data[k];
	}
	this.id = this.driver_id;
}

Driver.prototype.surname = function()
{
	var pos = this.name.indexOf( ' ' );
	if( pos == -1 ) return this.name;
	return this.name.substr( 0, pos );
};

Driver.prototype.coords = function() {
	return [this.latitude, this.longitude];
};

Driver.prototype.online = function() {
	return this.is_online == 1;
};

Driver.prototype.blocked = function()
{
	return this.block_until > time.utc();
};

Driver.prototype.blockDesc = function()
{
	if( !this.blocked() ) {
		return '';
	}

	var msg = 'Заблокирован до ';

	var now = new Date();
	var release = new Date( time.local( this.block_until ) * 1000 );

	if( release.getDate() == now.getDate() ) {
		msg += formatTime( release.getTime() / 1000 );
	} else {
		msg += formatDateTime( release.getTime() / 1000 );
	}
	if( this.block_reason != '' ) {
		msg += ' (' + this.block_reason + ')';
	}
	return msg;
};

Driver.prototype.format = function()
{
	if( !this.name ) return this.call_id;

	var s = this.name;
	if( this.phone ) {
		s += ', тел. ' + formatPhone( this.phone );
	}
	return s;
};


/*
 * Takes raw phone number string and formats it nicely.
 * The format is "+375 <code> <3d>-<2d>-<2d>".
 */
function formatPhone( str )
{
	if( !str ) return str;
	var original = str;
	if( str.indexOf( "+375" ) == 0 ) {
		str = str.substr( 4 );
	}

	str = str.replace( /[^\d]/g, '' );

	var parts = [
		str.substr( 0, 2 ),
		str.substr( 2, 3 ),
		str.substr( 5, 2 ),
		str.substr( 7 )
	];

	if( parts[3] == '' || parts[3].length > 2 ) return original;

	var s = '+375 ' + parts.shift();
	if( parts.length > 0 ) {
		s += ' ' + parts.join( '-' );
	}

	return s;
}

/*
 * Formats time as hour:minute. The argument is UTC seconds.
 */
function formatTime( time )
{
	var d = new Date();
	d.setTime( time * 1000 );
	return fmt( "%02d:%02d", d.getHours(), d.getMinutes() );
}

/*
 * Formats unixtime as "day.month.year hours:minutes".
 */
function formatDateTime( time )
{
	var d = new Date();
	d.setTime( time * 1000 );

	return fmt( "%02d.%02d.%d %02d:%02d",
		d.getDate(),
		d.getMonth() + 1,
		d.getFullYear(),
		d.getHours(),
		d.getMinutes()
	);
}
