var React = require('react');
var ReactDOM = require('react-dom');

import ServiceLogWidget from '../widgets/service-log.js';

export default class ServiceLog extends React.Component {
	componentDidMount() {
		var w = new ServiceLogWidget(this.props.client);
		ReactDOM.findDOMNode(this).firstChild.appendChild(w.root());
	}
	render() {
		return <div className="service-log"><div></div></div>;
	}
};