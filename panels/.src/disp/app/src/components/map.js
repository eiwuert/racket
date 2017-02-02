var React = require('react');
var ReactDOM = require('react-dom');

export default class MapC extends React.Component {
	createMap() {
		var root = ReactDOM.findDOMNode(this).firstChild;

		var b = this.props.bounds;
		if(b) {
			var center = [
				(b.min_lat + b.max_lat) / 2,
				(b.min_lon + b.max_lon) / 2
			];
		}

		var map = L.map(root, {
			//center: center,
			zoom: 11
		});

		var osm = new L.TileLayer(
			location.protocol + "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				minZoom: 7, maxZoom: 18,
				attribution: "Map data © OpenStreetMap contributors"
			}
		);
		map.addLayer(osm);
		return map;
	}

	componentDidMount() {
		if (this.map) {
			return;
		}
		this.map = this.createMap();
		this.markers = [];
		this.routes = [];

		var l = this.map;
		var t = this;

		l.on('moveend', function() {
			if(!t.props.onMoveEnd) {
				return;
			}
			var b = l.getBounds();
			t.props.onMoveEnd({
				min_lat: b.getSouth(),
				max_lat: b.getNorth(),
				min_lon: b.getWest(),
				max_lon: b.getEast()
			});
		});
		
		l.on('click', function(e) {
			if(!t.props.onClick) {
				return;
			}
			t.props.onClick([e.latlng.lat, e.latlng.lng]);
		});
		
		l.on('contextmenu', function(e) {
			if(!t.props.onContextMenu) {
				return;
			}
			t.props.onContextMenu([e.latlng.lat, e.latlng.lng]);
		});

		this.sync(this.props);
	}

	sync(props) {
		var t = this;
		var l = this.map;

		var b = props.bounds;
		if(b) {
			l.fitBounds([
				[b.min_lat, b.min_lon],
				[b.max_lat, b.max_lon]
			]);
		}

		t.markers.forEach(m => l.removeLayer(m));
		t.markers = [];
		if(props.markers) {
			props.markers.forEach(function(p) {
				var m = L.marker(p.coords, p.options);
				m.addTo(l);
				t.markers.push(m);
			});
		}
		
		t.routes.forEach(r => l.removeLayer(r));
		t.routes = [];
		if(props.routes) {
			props.routes.forEach(function(points) {
				var r = L.polyline(points).addTo(l);
			});
		}
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
