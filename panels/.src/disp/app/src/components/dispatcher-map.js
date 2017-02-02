var React = require('react');
var ReactDOM = require('react-dom');

import MapC from './map.js';
import EventRepeater from '../event-repeater.js';

var flagIcon = L.icon({
	iconUrl: "/res/dispatcher/images/flag-icon.png",
	iconSize: [25, 27],
	iconAnchor: [12, 27]
});

export default class DispatcherMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bounds: {min_lat: -50, max_lat: 50, min_lon: -180, max_lon: 180},
			queues: getQueues(),
			drivers: getDrivers()
		};
		
		this.repeater = new EventRepeater(disp);

		this.selectArea = this.selectArea.bind(this);
		this.refreshDrivers = this.refreshDrivers.bind(this);
	}

	selectArea(bounds) {
		this.setState({bounds});
	}
	
	refreshDrivers() {
		this.setState({drivers: getDrivers()});
	}

	componentDidMount() {
		this.repeater.on('driver-online-changed', this.refreshDrivers);
		this.repeater.on('driver-moved', this.refreshDrivers);
	}

	componentWillUnmount() {
		this.repeater.off('driver-online-changed', this.refreshDrivers);
		this.repeater.off('driver-moved', this.refreshDrivers);
	}

	render() {
		return (<div className="main-map">
			<Controls onSelect={this.selectArea}/>
			<MapC
				bounds={this.state.bounds}
				markers={this.state.queues.concat(this.state.drivers)}
				onMoveEnd={this.selectArea}
				/>
		</div>);
	}
};

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

function getQueues() {
	return disp.queues().filter(q => q.coords()[0]).map(function(q) {
		return {
			coords: q.coords(),
			options: {
				title: q.name,
				icon: flagIcon
			}
		};
	});
}

function getDrivers() {
	return disp.drivers().filter(function(d) {
		return (
			d.online()
			&& d.is_fake != '1'
			&& d.coords()[0]
			&& d.car_id
		);
	})
	.map(function(d) {
		return {
			coords: d.coords(),
			options: {
				title: d.call_id
			}
		};
	});
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

