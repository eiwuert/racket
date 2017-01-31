var React = require('react');
var ReactDOM = require('react-dom');

class Options extends React.Component {
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

export default function OptionsSection( $container )
{
	var s = {
		carClass: 'ordinary',
		vip: false,
		term: false,
		disabled: false
	};
	
	function sync() {
		ReactDOM.render(
			<Options carClass={s.carClass} onCarClassChange={onClassChange}
				vip={s.vip} onVipChange={onVipChange}
				term={s.term} onTermChange={onTermChange}
				disabled={s.disabled} />,
			$container.get(0)
		);
	}
	
	sync();
	
	function onClassChange(e) {
		s.carClass = e.target.value;
		sync();
	}
	
	function onVipChange(e) {
		s.vip = e.target.checked;
		sync();
	}
	
	function onTermChange(e) {
		s.term = e.target.checked;
		sync();
	}

	this.get = function() {
		return {
			opt_car_class: s.carClass,
			opt_vip: s.vip? '1' : '0',
			opt_terminal: s.term? '1' : '0'
		};
	};

	this.set = function( order ) {
		s.carClass = order.opt_car_class;
		s.vip = order.opt_vip == '1';
		s.term = order.opt_terminal == '1';
		sync();
	};

	this.disable = function() {
		s.disabled = true;
		sync();
	};

	this.enable = function() {
		s.disabled = false;
		sync();
	};
}

