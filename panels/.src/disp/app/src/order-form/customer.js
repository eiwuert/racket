import {formatPhone} from '../../lib/format.js';

var React = require('react');
var ReactDOM = require('react-dom');

import RCustomerSection from '../components/order-form/customer.js';

export default function CustomerSection( $container )
{
	var c = document.createElement('div');
	$container.append(c);
	
	var s = {
		name: '',
		phone: ''
	};
	
	function r() {
		ReactDOM.render(<RCustomerSection
			name={s.name} phone={s.phone}
			onPhoneChange={onPhoneChange}
			onNameChange={onNameChange}
			onAddress={onAddressAccept}
			/>, c);
	}
	r();
	
	function onPhoneChange(phone) {
		s.phone = phone;
		s.name = '';
		r();
	}
	
	function onNameChange(name) {
		s.name = name;
		r();
	}
	
	var onAddress = null;
	function onAddressAccept(addr) {
		onAddress(addr);
	}

	this.get = function() {
		return {
			customer_phone: s.phone,
			customer_name: s.name
		};
	};
	
	this.onAddress = function( func ) {
		onAddress = func;
	};

	this.set = function( order )
	{
		var phone = order.customer_phone;
		var name = order.customer_name;
		if( phone ) {
			phone = formatPhone( phone );
		}
		s.phone = phone;
		s.name = name;
		r();
	};

	this.setPhone = function( phone, trigger )
	{
		s.phone = phone;
		s.name = '';
		r();
		if( trigger ) {
			console.warn("Can't trigger phonechange");
		}
	};
}
