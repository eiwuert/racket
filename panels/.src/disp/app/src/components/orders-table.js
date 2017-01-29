var React = require('react');
var ReactDOM = require('react-dom');

import OrdersTableWidget from '../widgets/orders-table.js';

export default class OrdersTable extends React.Component {
	componentDidMount() {
		var w = new OrdersTableWidget(this.props.client);
		ReactDOM.findDOMNode(this).firstChild.appendChild(w.root());
	}

	render() {
		return <div className="orders-table"><div></div></div>;
	}
};
