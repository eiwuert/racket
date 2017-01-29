var React = require('react');
var ReactDOM = require('react-dom');

import CalculatorWidget from '../widgets/calculator/calculator.js';

export default class Calculator extends React.Component {
	componentDidMount() {
		var w = new CalculatorWidget(this.props.client);
		ReactDOM.findDOMNode(this).firstChild.appendChild(w.root());
	}

	render() {
		return <div className="calculator"><div></div></div>;
	}
};
