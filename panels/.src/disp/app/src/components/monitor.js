var React = require('react');
var ReactDOM = require('react-dom');

import initMonitorWidget from '../widgets/monitor/monitor.js';
import initChat from '../chat/chat.js';

export default class Monitor extends React.Component {
	componentDidMount() {
		var c = ReactDOM.findDOMNode(this).firstChild;
		var monitor = initMonitorWidget(this.props.client);
		c.appendChild(monitor.root);
		initChat( this.props.client, monitor.qw );
	}

	render() {
		return <div className="monitor"><div></div></div>;
	}
};