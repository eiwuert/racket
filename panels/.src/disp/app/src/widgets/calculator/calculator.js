//import CalcAddressPicker from './address-picker.js';
import {formatNumber} from '../../../lib/format.js';
import {fmt} from '../../../lib/fmt.js';
import Map from '../../../lib/map.js';

var L = window.L;

var React = require('react'), ReactDOM = require('react-dom');
import AddressInput from '../../components/address-input.js';

function emptyAddr() {
	return {place: disp.param('default_city'), street: '', house: '', building: '', entrance: '', apartment: ''};
}

export default function CalculatorWidget( disp )
{
	var $container = $( '<div id="calc-widget"></div>' );

	this.root = function() {
		return $container.get(0);
	};

	var $pane = $( '<div class="controls"></div>' );
	$container.append( $pane );

	$pane.append( '<b>Откуда</b>' );
	var fromContainer = document.createElement('div');
	$pane.append(fromContainer);
	$pane.append( '<b>Куда</b>' );
	var toContainer = document.createElement('div');
	$pane.append(toContainer);
	
	var s = {
		fromAddr: emptyAddr(),
		destAddr: emptyAddr()
	};

	function r() {
		ReactDOM.render(<AddressInput address={s.fromAddr} onChange={setFromAddr}/>, fromContainer);
		ReactDOM.render(<AddressInput address={s.destAddr} onChange={setDestAddr}/>, toContainer);
	}
	r();
	
	function setFromAddr(a) {
		s.fromAddr = a;
		syncFromAddr(fromMarker, a);
		r();
	}
	
	function setDestAddr(a) {
		s.destAddr = a;
		syncFromAddr(destMarker, a);
		r();
	}

	function syncFromAddr(marker, addr) {
		/*
		 * Remove marker and output.
		 */
		marker.setLatLng( [0, 0] );
		route.setLatLngs( [[0, 0]] );
		$output.empty();
		/*
		 * Request coordinates, then put marker and recalculate.
		 */
		mapdata.getAddressBounds( addr, function( bounds ) {
			if( !bounds ) {
				$output.html( 'Не удалось определить координаты по адресу' );
				return;
			}
			marker.setLatLng( [bounds.lat, bounds.lon] );
			updateEstimation();
		});
	}
	
	var map = createMap();
	var $fares = createFares();
	var $output = $( '<div class="output"></div>' );
	$pane.append( $output );

	function createMap()
	{
		var $map = $( '<div class="map"></div>' );
		$container.append( $map );
		var map = new Map( $map.get(0) );
		map.addZoomControl( "topleft" );
		map = map.leaflet;
		$(window).on( "resize", function() {
			map.invalidateSize();
		});
		return map;
	}

	function createFares()
	{
		var s = '<label>Тариф</label><select>';
		disp.fares().forEach( function( f, i ) {
			s += '<option value="'+i+'">'+f.name+'</option>';
		});
		s += '</select>';
		var $s = $( s );
		$pane.append( $s );
		return $s.filter( 'select' );
	}

	var fromMarker = L.marker( [0, 0],
		{draggable: true, title: "Точка отправки"} ).addTo( map );
	var destMarker = L.marker( [0, 0],
		{draggable: true, title: "Точка прибытия"} ).addTo( map );
	var route = L.polyline( [[0, 0]] ).addTo( map );

	var routeData = null;

	$fares.on( "change", function() {
		showData();
	});

	fromMarker.addEventListener( "dragend",
		syncFromMarker.bind( undefined, fromMarker, 'fromAddr' ) );
	destMarker.addEventListener( "dragend",
		syncFromMarker.bind( undefined, destMarker, 'destAddr' ) );

	map.addEventListener( 'click', function( event )
	{
		fromMarker.setLatLng( event.latlng );
		syncFromMarker( fromMarker, 'fromAddr' );
		return false;
	});
	
	map.addEventListener( 'contextmenu', function( event )
	{
		destMarker.setLatLng( event.latlng );
		syncFromMarker( destMarker, 'destAddr' );
		return false;
	});

	function syncFromMarker( marker, addrName )
	{
		/*
		 * Empty address picker, request and show address.
		 */
		s[addrName] = emptyAddr();
		r();

		var pos = marker.getLatLng();
		mapdata.getPointAddress( pos.lat, pos.lng,
			function( addr ) {
				for( var k in addr ) {
					addr[k.replace("address_", "")] = addr[k];
				}
				s[addrName] = addr;
				r();
			}
		);

		route.setLatLngs( [[0, 0]] );
		$output.empty();

		updateEstimation();
	}

	function updateEstimation()
	{
		var from = fromMarker.getLatLng();
		var to = destMarker.getLatLng();
		if( from.lat == 0 || to.lat == 0 ) {
			return;
		}

		disp.dx.get( "route", {from: from.lat + "," + from.lng,
			to: to.lat + "," + to.lng} )
		.then( function( data )
		{
			routeData = data;
			showData();
		})
		.catch( function( error ) {
			$output.html( "Не удалось проложить маршрут: " + error );
		});
	}

	function showData()
	{
		var data = routeData;

		route.setLatLngs( data.route_geometry );
		map.fitBounds( route.getBounds() );

		var d = data.route_summary.total_distance;
		var fare = disp.fares()[$fares.val()];

		var price = fare.price( d );
		price = Math.round( price/1000 ) * 1000;

		$output.html(
			fmt( "%.1f км, %s руб.", d/1000, formatNumber( price ) )
		);
	}
}
