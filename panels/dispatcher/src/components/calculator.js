import {formatNumber} from '../../lib/format.js';
import MapC from './map.js';
import AddressInput from './address-input.js';

var React = require('react');
var ReactDOM = require('react-dom');
var L = window.L;
var _ = require('underscore');

function emptyAddr() {
	return {place: disp.param('default_city'), street: '', house: '', building: '', entrance: '', apartment: ''};
}

export default class Calculator extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fareId: 0,
			fromAddr: emptyAddr(),
			destAddr: emptyAddr(),
			distance: 0,
			error: '',
			from: [0, 0],
			to: [0, 0],
			route: [[0, 0]],
			mapBounds: null
		};

		var m = [
			'changeFare',
			'setFromAddr',
			'setDestAddr',
			'syncFromAddr',
			'syncFromMarker',
			'setFrom',
			'setTo'
		];
		var t = this;
		m.forEach(function(name) {
			t[name] = t[name].bind(t);
		});
	}

	changeFare(id) {
		this.setState({fareId: id});
	}

	setFromAddr(a) {
		this.setState({fromAddr: a});
		this.syncFromAddr('from', a);
	}

	setDestAddr(a) {
		this.setState({destAddr: a});
		this.syncFromAddr('to', a);
	}

	syncFromAddr(markerName, addr) {
		this.setState({
			[markerName]: [0, 0],
			route: [[0, 0]],
			distance: 0
		});
		var t = this;
		/*
		 * Request coordinates, then put marker and recalculate.
		 */
		mapdata.getAddressBounds(addr, function(bounds) {
			if (!bounds) {
				t.setState({error: 'Не удалось определить координаты по адресу'});
				return;
			}
			t.setState({
				[markerName]: [bounds.lat, bounds.lon]
			});
			t.updateEstimation();
		});
	}

	setFrom(coords) {
		this.setState({from: coords});
		this.syncFromMarker('from', 'fromAddr');
	}

	setTo(coords) {
		this.setState({to: coords});
		this.syncFromMarker('to', 'destAddr');
	}

	syncFromMarker(markerName, addrName)
	{
		this.setState({
			[addrName]: emptyAddr()
		});

		var pos = this.state[markerName];
		var t = this;
		mapdata.getPointAddress(pos[0], pos[1],
			function(addr) {
				for (var k in addr) {
					addr[k.replace("address_", "")] = addr[k];
				}
				t.setState({
					[addrName]: addr
				});
			}
		);

		this.setState({
			route: [[0, 0]],
			error: '',
			distance: 0
		});
		this.updateEstimation();
	}

	updateEstimation()
	{
		var s = this.state;
		if (s.from[0] == 0 || s.to[0] == 0) {
			return;
		}
		var t = this;

		disp.dx.get("route", {from: s.from[0] + "," + s.from[1],
			to: s.to[0] + "," + s.to[1]})
			.then(function(data)
			{
				t.showData(data);
			})
			.catch(function(error) {
				s.error = "Не удалось проложить маршрут: " + error;
				r();
			});
	}

	showData(data)
	{
		var points = data.route_geometry;
		var distance = data.route_summary.total_distance;

		var lats = points.map(p => p[0]);
		var lons = points.map(p => p[1]);
		var bounds = {
			min_lat: _.min(lats),
			max_lat: _.max(lats),
			min_lon: _.min(lons),
			max_lon: _.max(lons)
		};
		this.setState({
			route: points,
			distance: distance,
			mapBounds: bounds
		});
	}

	render() {
		var s = this.state;
		var markers = [
			{coords: s.from, options: {title: 'from'}},
			{coords: s.to, options: {title: 'to'}}
		];
		return (<div className="calculator">
			<div className="controls">
				<b>Откуда</b>
				<AddressInput address={s.fromAddr} onChange={this.setFromAddr}/>
				<b>Куда</b>
				<AddressInput address={s.destAddr} onChange={this.setDestAddr}/>
				<FareSelector value={s.fareId} onChange={this.changeFare}/>
			</div>
			<Result distance={s.distance} fareId={s.fareId} error={s.error}/>
			<MapC
				markers={markers}
				routes={[s.route]}
				onClick={this.setFrom}
				onContextMenu={this.setTo}
				bounds={s.mapBounds}
				/>
		</div>);
	}
};

class FareSelector extends React.Component {
	change(e) {
		this.props.onChange(e.target.value);
	}

	render() {
		return (<div>
			<label>Тариф</label>
			<select value={this.props.value} onChange={this.change.bind(this)}>{
				disp.fares().map(function( f, i ) {
					return <option key={i} value={i}>{f.name}</option>;
				})
			}</select>
		</div>);
	}
};

class Result extends React.Component {
	render() {
		if(this.props.error) {
			return <div className="output">{this.props.error}</div>;
		}

		var meters = this.props.distance;
		var fare = disp.fares()[this.props.fareId];
		var price = Math.round(fare.price(meters)/1000)*1000;
		return (<div className="output">
			{(meters/1000).toFixed(1)} км, {formatNumber(price)} р.
		</div>);
	}
};
