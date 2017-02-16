import './lib/autocomplete.js';
import './lib/http.js';
import './lib/mapdata.js';

$(document).ready(function()
{
	var $city = $( '[name="s-default_city"]' );
	$city.autocomplete( mapdata.getPlaceSuggestions );
});
