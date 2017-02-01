import Map from '../../lib/map.js';

var React = require('react'), ReactDOM = require('react-dom');

class MapC extends React.Component {

	componentDidMount() {
		if(this.map) return;
		
		this.map = this.createMap(ReactDOM.findDOMNode(this).firstChild);
		this.props.setMap(this.map);
		
		this.markers = [];
		
		var l = this.map.leaflet;
		var t = this;
	
		l.on('move', function() {
			var b = l.getBounds();
			t.props.onMove({
				min_lat: b.getSouth(),
				max_lat: b.getNorth(),
				min_lon: b.getWest(),
				max_lon: b.getEast()
			});
		});
	}

	createMap(c) {
		var map = new Map(c);
		map.addZoomControl( 'topleft' );
		map.setBounds = function( b ) {
			map.fitBounds( b.min_lat, b.max_lat, b.min_lon, b.max_lon );
		};
		return map;
	}
	
	componentWillReceiveProps(nextProps) {
		var t = this;
		var map = this.map;
		var l = map.leaflet;

		map.setBounds(nextProps.bounds);
		
		t.markers.forEach(m => l.removeLayer(m));
		t.markers = [];
		nextProps.markers.forEach(function(p, i) {
			var m = L.marker(p.coords, p.options);
			m.addTo(l);
			t.markers.push(m);
		});
	}

	render() {
		return (<div>
			<div className="map"></div>
		</div>);
	}
};


export default function MapWidget( disp )
{
	var $container = $( '<div id="map-widget"></div>' );
	this.root = function() {
		return $container.get(0);
	};

	// driver id => marker name
	var driverClasses = {};
	
	//var map = createMap();
	var map;

	function receiveMap(m) {
		map = m;
		
		$(window).on( "resize", function() {
			map.leaflet.invalidateSize();
		});
		showDrivers( map );
	}
	
	var c = document.createElement('div');
	$container.append(c);
	ReactDOM.render(<Controls onSelect={selectArea}/>, c);
	
	
	var s = {
		bounds: {min_lat: -50, max_lat: 50, min_lon: -180, max_lon: 180},
		markers: []
	};
	
	var flagIcon = L.icon({
		iconUrl: "/res/dispatcher/images/flag-icon.png",
		iconSize: [25, 27],
		iconAnchor: [12, 27]
	});
	
	disp.queues().forEach( function( q )
	{
		var coords = q.coords();
		if( !coords[0] || !coords[1] ) {
			return;
		}
		var options = {
			title: q.name,
			icon: flagIcon
		};
		s.markers.push({coords, options});
	});
	
	var d = document.createElement('div');
	$container.append(d);
	function r() {
		ReactDOM.render(<MapC setMap={receiveMap}
			bounds={s.bounds}
			markers={s.markers}
			onMove={onMove}
			/>, d);
	}
	r();
	
	function onMove(b) {
		s.bounds = b;
	}

	function selectArea(bounds) {
		s.bounds = bounds;
		r();
		//map.setBounds(bounds);
	}
	
	getBounds().then(function(list) {
		selectArea(list[0]);
	});

	this.setPosition = function( coords ) {
		var b = s.bounds;
		var center = [
			(b.min_lat + b.max_lat)/2,
			(b.min_lon + b.max_lon)/2
		];
		var dLat = coords[0] - center[0];
		var dLon = coords[1] - center[1];
		
		b.min_lat += dLat;
		b.max_lat += dLat;
		b.min_lon += dLon;
		b.max_lon += dLon;
		selectArea(b);


	};

	this.setZoom = function( level ) {
		console.warn("No setZoom");
		//map.setZoom( level );
	};
	
	function showDrivers( map )
	{
		disp.drivers().forEach( function( d )
		{
			if( !d.online() ) return;
			if( d.is_fake == '1' ) return;
			if( !d.coords()[0] ) return;
			if( !d.car_id ) return;
			putCarMarker( map, d );
		});

		disp.on( "driver-online-changed", function( event ) {
			var d = event.data.driver;
			if( d.online() ) {
				putCarMarker( map, d );
			} else {
				map.removeMarker( 'taxi_' + d.id );
			}
		});

		disp.on( 'driver-moved', function( event )
		{
			var driver = event.data.driver;
			putCarMarker( map, driver );
		});
	}



	this.setClass = function( driverId, className ) {
		driverClasses[driverId] = className;
		updateMarker( driverId );
	};

	this.removeClass = function( driverId, className ) {
		delete driverClasses[driverId];
		updateMarker( driverId );
	};

	function updateMarker( id )
	{
		var driver = disp.getDriver( id );
		if( driver.is_online != '1' ) {
			return;
		}
		putCarMarker( map, driver );
	}

	

	//--

	function putCarMarker( map, driver )
	{
		/*
		 * If the driver is offline, don't show the marker.
		 */
		var coords = driver.coords();
		if( !coords[0] ) return;

		var options = {
			title: driver.call_id,
			icon: L.icon({
				iconUrl: driverIconUrl( driver ),
				iconSize: [25, 27],
				iconAnchor: [12, 27]
			})
		};

		var m = map.setMarker( "taxi_" + driver.id,
			coords[0], coords[1], options );
		m.bindLabel( driver.call_id, { noHide: true } ).showLabel();
	}

	function driverIconUrl( driver )
	{
		var pref = "/res/dispatcher/images/map-icon-";

		if( driver.id in driverClasses ) {
			return pref + driverClasses[driver.id] + ".gif";
		}

		var car = disp.getDriverCar( driver.id );
		var body = car ? car.body_type : "none";
		var carClass;
		switch( body )
		{
			case 'estate':
			case 'minivan':
				carClass = car.body_type;
				break;
			default:
				carClass = 'ordinary';
		}

		var url = pref + carClass;
		if( car && car['class'] == 'vip' ) url += "-vip";
		url += ".png";
		return url;
	}

	//--
}

function onFirstDisplay( $e, func )
{
	var $w = $(window);
	function track()
	{
		if( !$e.is( ":visible" ) ) {
			return;
		}
		func();
		$w.off( "resize", track );
	}

	$w.on( "resize", track );
	track();
}


var boundsCache = null;

function getBounds()
{
	if(boundsCache) {
		return Promise.resolve(boundsCache);
	}

	var P = {ok: null, fail: null};
	var promise = new Promise( function( ok, fail )
	{
		P.ok = ok;
		P.fail = fail;
	});

	var minskBounds = {
		name: "Минск и окрестность",
		min_lat: 53.87,
		max_lat: 53.93,
		min_lon: 27.555,
		max_lon: 27.575
	};

	var town = disp.param( "default_city" );
	if( town ) {
		mapdata.getAddressBounds( {place: town}, function( bounds ) {
			bounds.name = town;
			boundsCache = [bounds];
			P.ok( [bounds] );
		});
	}
	else {
		boundsCache = [minskBounds];
		P.ok( [minskBounds] );
	}
	return promise;
}

class Controls extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ready: false,
			areas: []
		}
	}

	componentDidMount() {
		getBounds().then(areas => this.setState({ready: true, areas: areas}));
	}

	render() {
		if(!this.state.ready) {
			return <div>Загрузка...</div>;
		}

		return (<div>{
			this.state.areas.map((b, i) => <button type="button" key={i}
				onClick={this.props.onSelect.bind(undefined, b)}>{b.name}</button>)
		}</div>);
	}
};