export default OrderForm;

import Listeners from '../lib/listeners.js';
import Form from '../components/order-form/form.js';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var Order = window.Order;
	
function OrderForm( order )
{
	var listeners = new Listeners([
		"cancel",
		"submit"
	]);
	this.on = listeners.add.bind( listeners );
	
	var root = document.createElement('div');

	var title = order ? ("Заказ № " + order.order_id) : "Новый заказ";
	var s = getState(order);
	var status = '';
	
	var fc = document.createElement('div');
	root.appendChild(fc);
	function r() {
		ReactDOM.render(<Form
			title={title}
			order={s}
			status={status}
			onChange={onFormChange}
			onAccept={accept}
			onCancel={cancel}
			onCustomerAddress={onCustomerAddress}/>, fc);
	}
	r();
	
	var $controls = $(fc).find( "input, select, button:not(.cancel), textarea" );
	
	function onFormChange(order) {
		s = order;
		r();
	}
	
	function onCustomerAddress(addr) {
		s.sourceLocation = {
			addr: addr,
			id: null,
			name: ''
		};
		r();
	}
	
	function accept() {
		listeners.call( "submit", {
			order: getOrder(),
			driverId: s.driverId
		});
	}
	
	function cancel() {
		listeners.call( "cancel" );
	}

	this.setTitle = function( newtitle, className ) {
		if(className) console.warn("Can't set title className");
		title = newtitle;
		r();
	};

	this.setDriver = function( id ) {
		s.driverId = id;
		r();
	};
	
	

	this.root = function() {
		return root;
	};

	this.lock = function( newstatus ) {
		status = newstatus;
		r();
		$controls.prop( "disabled", true );
	};

	this.unlock = function() {
		status = '';
		r();
		$controls.prop( "disabled", false );
	};

	this.locked = function() {
		return status != '';
	};

	this.orderId = function() {
		if( !order ) return null;
		return order.order_uid;
	};

	this.setQueue = function( qid ) {
		var loc = disp.getQueueLocation(qid);
		if(!loc) return;
		s.sourceLocation = loc;
		r();
	};

	this.setCustomerPhone = function( phone, trigger ) {
		s.customer.phone = phone;
		s.customer.name = '';
		if( trigger ) {
			console.warn("Can't trigger phonechange");
		}
		r();
	};

	function getOrder()
	{
		var p;
		if(!s.postpone.disabled) {
			p = {
				exp_arrival_time: s.postpone.time,
				reminder_time: s.postpone.time - s.postpone.remind * 60
			};
		}
		else {
			p = {
				exp_arrival_time: null,
				reminder_time: null
			};
		}

		var data = _.extend(p, {
			opt_car_class: s.opt.carClass,
			opt_vip: s.opt.vip? '1' : '0',
			opt_terminal: s.opt.term? '1' : '0',
			customer_phone: s.customer.phone,
			customer_name: s.customer.name
		});
		data.comments = s.comments;
		data.status = Order.prototype.POSTPONED;
		data.src = {
			addr: s.sourceLocation.addr,
			loc_id: s.sourceLocation.id
		};
		data.dest = {
			addr: s.destLocation.addr,
			loc_id: s.destLocation.id
		};

		if( order ) {
			for( var k in data ) {
				order[k] = data[k];
			}
		} else {
			order = new Order( data );
		}

		return order;
	}
}

function emptyAddr() {
	return {
		place: '',
		street: '',
		house: '',
		building: '',
		entrance: '',
		apartment: ''
	};
}

function getState(order) {
	var s = {
		driverId: '0',
		opt: {
			carClass: 'ordinary',
			vip: false,
			term: false
		},
		postpone: {
			disabled: true,
			time: 0,
			remind: 0
		},
		customer: {
			name: '',
			phone: ''
		},
		comments: '',
		
		sourceLocation: {
			addr: emptyAddr(),
			id: null,
			name: ''
		},
		destLocation: {
			addr: emptyAddr(),
			id: null,
			name: ''
		}
	};
	s.sourceLocation.addr.place = disp.param('default_city');
	s.destLocation.addr.place = disp.param('default_city');
	
	if(order) {
		s.opt = {
			carClass: order.opt_car_class,
			vip: order.opt_vip == '1',
			term: order.opt_terminal == '1'
		};
		
		if( order.exp_arrival_time )
		{
			s.postpone.disabled = false;
			s.postpone.time = order.exp_arrival_time;
			s.postpone.remind = Math.round((order.exp_arrival_time - order.reminder_time)/60);
		}
		else {
			s.postpone.disabled = true;
		}
		
		if( order.src ) {
			s.sourceLocation = {
				addr: order.src.addr || emptyAddr(),
				id: order.src.loc_id,
				name: ''
			};
		}
		if(order.dest) {
			s.destLocation = {
				addr: order.dest.addr || emptyAddr(),
				id: order.dest.loc_id,
				name: ''
			};
		}
		
		s.customer = {
			name: order.customer_name,
			phone: order.customer_phone
		};
		s.comments = order.comments;
	}
	
	return s;
}
