import {fmt} from '../../lib/fmt.js';

var React = require('react');
var ReactDOM = require('react-dom');

export default class Postpone extends React.Component {
	onCheck(e) {
		this.props.onToggle(e.target.checked);
	}
	render() {
		return (<div>
			<label><input
				type="checkbox"
				checked={this.props.enabled}
				onChange={this.onCheck.bind(this)}
				/> Отложить заказ</label>
			<Picker
				disabled={!this.props.enabled}
				time={this.props.time}
				remind={this.props.remind}
				onTimeChange={this.props.onTimeChange}
				onRemindChange={this.props.onRemindChange}/>
		</div>);
	}
};

class Picker extends React.Component {
	onTimeChange(e) {
		var t = parseTime(e.target.value);
		if(!t) return;
		this.props.onTimeChange(t);
	}
	
	onRemindChange(e) {
		this.props.onRemindChange(e.target.value);
	}

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
					onChange={this.onTimeChange.bind(this)}/>
			</div>
			<div>
				<label>Напоминание</label>
				<input type="number" min="0" step="5" size="2"
					disabled={this.props.disabled}
					value={this.props.remind}
					onChange={this.onRemindChange.bind(this)}
					/> мин. до подачи
				</div>
		</div>);
	}
};

function parseTime(dt) {
	var d = parseDateTime(dt);
	if(!d) return null;
	return time.utc(Math.round(d.getTime()/1000));
}

/*
 * Parses a string like "2000-01-01T00:00[:00]" and returns a Date
 * object.
 */
function parseDateTime( dt )
{
	var re = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)$/;
	var match = dt.match( re );
	if( !match ) {
		re = /^(\d\d\d\d)-(\d\d)-(\d\d)T(\d\d):(\d\d)$/;
		match = dt.match( re );
	}

	if( !match ) return null;

	var Y = match[1];
	var M = match[2] - 1; /* 0-based, surprise! */
	var D = match[3];
	var h = match[4];
	var m = match[5];
	var s = (match.length > 6)? match[6] : 0;
	var d = new Date( Y, M, D, h, m, s );
	return d;
}
