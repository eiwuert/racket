var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

export default class Options extends React.Component {
	onChange(key, event) {
		var o = _.clone(this.props.options);
		o[key] = event.target.value;
		this.props.onChange(o);
	}

	render() {
		var cn = this.props.disabled? 'disabled' : '';
		var o = this.props.options;
		return (<div className={cn}>
			<select value={o.carClass}
				onChange={this.onChange.bind(this, 'carClass')}
				disabled={this.props.disabled}>
				<option value="ordinary">Любой</option>
				<option value="sedan">Седан</option>
				<option value="estate">Универсал</option>
				<option value="minivan">Минивен</option>
			</select>
			<label><input type="checkbox"
				checked={o.vip}
				onChange={this.onChange.bind(this, 'vip')}
				disabled={this.props.disabled} /> VIP</label>
			<label><input type="checkbox"
				checked={o.term}
				onChange={this.onChange.bind(this, 'term')}
				disabled={this.props.disabled} /> Терминал</label>
		</div>);
	}
};
