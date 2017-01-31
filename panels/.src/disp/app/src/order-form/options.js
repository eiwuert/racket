var React = require('react');
var ReactDOM = require('react-dom');

import Options from '../components/order-form/options.js';

export default function OptionsSection( $container )
{
	var s = {
		opt: {
			carClass: 'ordinary',
			vip: false,
			term: false
		},
		disabled: false
	};
	
	function sync() {
		ReactDOM.render(
			<Options options={s.opt} onChange={onChange} disabled={s.disabled} />,
			$container.get(0)
		);
	}
	sync();
	
	function onChange(opt) {
		s.opt = opt;
		sync();
	}

	this.get = function() {
		return {
			opt_car_class: s.opt.carClass,
			opt_vip: s.opt.vip? '1' : '0',
			opt_terminal: s.opt.term? '1' : '0'
		};
	};

	this.set = function( order ) {
		s.opt.carClass = order.opt_car_class;
		s.opt.vip = order.opt_vip == '1';
		s.opt.term = order.opt_terminal == '1';
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

