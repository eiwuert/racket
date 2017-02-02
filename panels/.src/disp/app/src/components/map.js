var React = require('react');
var ReactDOM = require('react-dom');

import Map from '../../lib/map.js';

export default class MapC extends React.Component {

	componentDidMount() {
		if (this.map)
			return;

		this.map = this.createMap(ReactDOM.findDOMNode(this).firstChild);
		this.markers = [];

		var l = this.map.leaflet;
		var t = this;

		l.on('moveend', function() {
			var b = l.getBounds();
			t.props.onMoveEnd({
				min_lat: b.getSouth(),
				max_lat: b.getNorth(),
				min_lon: b.getWest(),
				max_lon: b.getEast()
			});
		});

		this.sync(this.props);
	}

	createMap(c) {
		var map = new Map(c);
		map.addZoomControl('topleft');
		map.setBounds = function(b) {
			map.fitBounds(b.min_lat, b.max_lat, b.min_lon, b.max_lon);
		};
		return map;
	}

	sync(props) {
		var t = this;
		var map = this.map;
		var l = map.leaflet;

		map.setBounds(props.bounds);

		t.markers.forEach(m => l.removeLayer(m));
		t.markers = [];
		props.markers.forEach(function(p, i) {
			var m = L.marker(p.coords, p.options);
			m.addTo(l);
			t.markers.push(m);
		});
	}

	componentWillReceiveProps(nextProps) {
		this.sync(nextProps);
	}

	render() {
		return (<div>
	<div className="map"></div>
</div>);
	}
};
