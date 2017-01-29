var React = require('react');
var ReactDOM = require('react-dom');

import DriversTableWidget from '../widgets/drivers-table.js';

export default class DriversTable extends React.Component {
	componentDidMount() {
		var dw = new DriversTableWidget(this.props.client);
		ReactDOM.findDOMNode(this).firstChild.appendChild(dw.root());
	}

	render() {
		return <div className="drivers-table"><div></div></div>;
	}
};