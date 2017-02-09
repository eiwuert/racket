import Location from './obj/location.js';
import obj from '../lib/obj.js';

export default function initLocations( conn, listeners, data )
{
	var disp = this;
	var locations = {};

	data.queue_locations.forEach( function( d ) {
		var loc = new Location( d );
		locations[loc.id] = loc;
	});

	this.locations = function() {
		return obj.toArray( locations );
	};

	this.getLocation = function( locId ) {
		return locations[locId];
	};

	this.getQueueLocation = function( qid ) {
		for( var locid in locations ) {
			if( locations[locid].queue_id == qid ) {
				return locations[locid];
			}
		}
		return null;
	};

	this.suggestLocations = function( term ) {
		return disp.dx().get( "locations", {term: term} );
	};
}
