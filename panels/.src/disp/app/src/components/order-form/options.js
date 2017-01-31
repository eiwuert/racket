var React = require('react');
var ReactDOM = require('react-dom');

export default class Options extends React.Component {
	render() {
		var cn = this.props.disabled? 'disabled' : '';
		return (<div className={cn}>
			<select value={this.props.carClass} onChange={this.props.onCarClassChange} disabled={this.props.disabled}>
				<option value="ordinary">Любой</option>
				<option value="sedan">Седан</option>
				<option value="estate">Универсал</option>
				<option value="minivan">Минивен</option>
			</select>
			<label><input type="checkbox"
				checked={this.props.vip}
				onChange={this.props.onVipChange}
				disabled={this.props.disabled} /> VIP</label>
			<label><input type="checkbox"
				checked={this.props.term}
				onChange={this.props.onTermChange}
				disabled={this.props.disabled} /> Терминал</label>
		</div>);
	}
};