import {tpl} from '../../lib/fmt.js';
import html from '../../lib/html.js';

var React = require('react');
var ReactDOM = require('react-dom');

class DriverSelector extends React.Component {
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

export default function DriverSection( $container )
{
	var s = {
		id: ''
	};

	var _onChange = function() {};

	function onChange(e) {
		var t = e.target;
		s.id = e.target.value;
		r();
		_onChange.call(t);
	}

	this.onChange = function(f) {
		_onChange = f;
	};
	
	function r() {
		ReactDOM.render(<DriverSelector onChange={onChange} value={s.id}/>, $container.get(0));
	}
	
	r();

	
	this.get = function() {
		var id = s.id;
		if( id != "" ) {
			id = parseInt( id, 10 );
		}
		return id;
	};
	this.set = function( id ) {
		s.id = parseInt(id, 10);
		r();
	};
}
