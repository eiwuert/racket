import {fmt} from '../../../lib/fmt.js';

var React = require('react');
var ReactDOM = require('react-dom');

export default class Postpone extends React.Component {
	render() {
		var d = new Date(time.local(this.props.time) * 1000);
		var s = fmt( "%d-%02d-%02dT%02d:%02d",
			d.getFullYear(),
			d.getMonth() + 1,
			d.getDate(),
			d.getHours(),
			d.getMinutes()
		);
		return (<div>
			<div>
				<label>Время подачи машины</label>
				<input type="datetime-local"
					disabled={this.props.disabled}
					value={s}
					onChange={this.props.onTimeChange}/>
			</div>
			<div>
				<label>Напоминание</label>
				<input type="number" min="0" step="5" size="2"
					disabled={this.props.disabled}
					value={this.props.remind}
					onChange={this.props.onRemindChange}
					/> мин. до подачи
				</div>
		</div>);
	}
};
