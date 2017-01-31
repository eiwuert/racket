var React = require('react');
var ReactDOM = require('react-dom');

export default class DriverSelector extends React.Component {
	render() {
		return (<div>
			<label>Водитель</label>
			<select className="driver" value={this.props.value} onChange={this.props.onChange}>
			<option value="0">Выбрать автоматически</option>
			{disp.drivers().map(d => <option key={d.id} value={d.id}>{d.call_id} - {d.surname()}</option>)}
			</select>
		</div>);
	}
};