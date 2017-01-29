var React = require('react');
var ReactDOM = require('react-dom');

import SessionsWidget from '../widgets/sessions.js';

export default class SessionsTable extends React.Component {
	componentDidMount() {
		var w = new SessionsWidget(this.props.client);
		ReactDOM.findDOMNode(this).firstChild.appendChild(w.root());
	}

	render() {
		return <div className="sessions-table"><div></div></div>;
	}
};
