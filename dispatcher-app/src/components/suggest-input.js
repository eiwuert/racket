var React = require('react');
var ReactDOM = require('react-dom');

export default class SuggestInput extends React.Component {
	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		var $input = $(ReactDOM.findDOMNode(this));
		var t = this;
		$input.autocomplete(this.props.func, function(value, item) {
			t.props.onChange(value, item);
		});
	}

	handleChange(e) {
		this.props.onChange(e.target.value, null);
	}

	render() {
		return <input className={this.props.className} value={this.props.value} onChange={this.handleChange} />;
	}
};
