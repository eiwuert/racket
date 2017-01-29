var React = require('react');
var ReactDOM = require('react-dom');

import initAlerts from '../alarm.js';
import MapWidget from '../widgets/map.js';

export default class DispatcherMap extends React.Component {
	componentDidMount() {
		var map = new MapWidget(this.props.client);
		ReactDOM.findDOMNode(this).firstChild.appendChild(map.root());
		initAlerts(this.props.client, this.props.tabsWidget, map);
	}
	render() {
		return <div className="main-map"><div></div></div>;
	}
};
