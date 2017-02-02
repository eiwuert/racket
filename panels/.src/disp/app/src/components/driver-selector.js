var React = require('react');
var ReactDOM = require('react-dom');

export default class DriverSelector extends React.Component {
	onChange(event) {
		this.props.onChange(parseInt(event.target.value), 10);
	}

	render() {
		return (<div className="form-group">
			<label>Водитель</label>
			<select className="form-control" value={this.props.value} onChange={this.onChange.bind(this)}>
				<option value="0"></option>
				{this.props.drivers.map(d => <option key={d.id} value={d.id}>{d.call_id} - {d.surname()}</option>)}
			</select>
		</div>);
	}
};
