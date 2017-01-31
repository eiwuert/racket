export default OrderForm;

import AddressGroupSection from './address.js';
import CustomerSection from './customer.js';
import Options from '../components/order-form/options.js';
import Postpone from '../components/order-form/postpone.js';
import Listeners from '../../lib/listeners.js';
import html from '../../lib/html.js';
import obj from '../../lib/obj.js';
import {tpl} from '../../lib/fmt.js';

var React = require('react');
var ReactDOM = require('react-dom');

import DriverSelector from '../components/order-form/driver-selector.js';

function OrderForm( order )
{
	var listeners = new Listeners([
		"cancel",
		"submit"
	]);
	this.on = listeners.add.bind( listeners );

	var $container = $( '<form class="order-form"></form>' );
	/*
	 * Form title, for order number.
	 */
	var $title = $( '<div class="title"></div>' );
	$container.append( $title );
	
	var driverContainer = document.createElement('div');
	$container.append(driverContainer);
	
	var optionsContainer = document.createElement('div');
	$container.append(optionsContainer);

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
		}
	};
	
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
	}

	function onDriverChange(id) {
		s.driverId = id;
		r();
	}
	
	function onOptionsChange(opt) {
		s.opt = opt;
		r();
	}

	function r() {
		ReactDOM.render(<DriverSelector
			onChange={onDriverChange}
			value={s.driverId}/>, driverContainer);
		ReactDOM.render(<Options
			options={s.opt}
			onChange={onOptionsChange}
			disabled={s.driverId != '0'}/>, optionsContainer);
	}
	r();

	this.setDriver = function( id ) {
		s.driverId = id;
		r();
	};


	var customer = new CustomerSection( div() );

	$container.append( '<b>Место подачи</b>' );
	var from = new AddressGroupSection( $container );

	var $toHeader = $( '<b>Место назначения</b>' );
	$container.append( $toHeader );
	var to = new AddressGroupSection( div( 'dest-section' ), 'dest' );
	$toHeader.on( 'click', function() {
		to.slideToggle();
		$toHeader.toggleClass( 'more' );
	});
	to.hide();
	$toHeader.addClass( 'more' );

	var postponeContainer = document.createElement('div');
	$container.append(postponeContainer);
	
	function r2() {
		ReactDOM.render(<Postpone
			enabled={!s.postpone.disabled}
			time={s.postpone.time}
			remind={s.postpone.remind}
			onTimeChange={onPostponeTimeChange}
			onRemindChange={onPostponeRemindChange}
			onToggle={onPostponeToggle}
			/>, postponeContainer);
	}
	r2();
	
	function onPostponeToggle(enable) {
		s.postpone.disabled = !enable;
		if(enable) {
			s.postpone.time = time.utc();
			s.postpone.remind = 0;	
		}
		r2();
	}
	
	function onPostponeTimeChange(t) {
		s.postpone.time = t;
		r2();
	}
	
	function onPostponeRemindChange(remind) {
		s.postpone.remind = remind;
		r2();
	}

	

	customer.onAddress( function( addr ) {
		from.set({addr: addr, loc_id: null});
	});


	/*
	 * Comments input.
	 */
	var $comments = $( html.textarea( "Комментарии" ) );
	div().append( $comments );
	$comments = $comments.filter( 'textarea' );
	/*
	 * Status string, for progress reports.
	 */
	var $status = $( '<div class="status"></div>' );
	$container.append( $status );
	/*
	 * Buttons.
	 */
	addButtons();

	var $controls = $container.find( "input, select, button:not(.cancel), textarea" );

	function div( className ) {
		var $d = $( '<div></div>' );
		if( className ) $d.addClass( className );
		$container.append( $d );
		return $d;
	}

	if( order ) {
		$title.html( "Заказ № " + order.order_id );
		customer.set( order );
		$comments.val( order.comments );
		from.set( order.src );
		if( order.dest ) {
			to.set( order.dest );
		}
	}
	else {
		$title.html( "Новый заказ" );
	}

	this.root = function() {
		return $container.get(0);
	};

	this.lock = function( status ) {
		$status.html( status );
		$controls.prop( "disabled", true );
	};

	this.unlock = function() {
		$status.html( "" );
		$controls.prop( "disabled", false );
	};

	this.locked = function() {
		return $controls.prop( "disabled" );
	};

	this.orderId = function() {
		if( !order ) return null;
		return order.order_uid;
	};

	this.setQueue = function( qid ) {
		from.setQueue( qid );
	};

	this.setCustomerPhone = function( phone, trigger ) {
		customer.setPhone( phone, trigger );
	};

	this.setTitle = function( title, className ) {
		$title.html( title );
		$title.get(0).className = 'title ' + className;
	};

	function addButtons()
	{
		var $ok = $( '<button type="button">Отправить</button>' );
		var $no = $( '<button type="button" class="cancel">Закрыть</button>' );
		$container.append( $ok ).append( $no );
		$ok.on( 'click', function() {
			listeners.call( "submit", {
				order: getOrder(),
				driverId: s.driverId
			});
		});
		$no.on( "click", function() {
			listeners.call( "cancel" );
		});
	}

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

		var data = obj.merge(
			{
				opt_car_class: s.opt.carClass,
				opt_vip: s.opt.vip? '1' : '0',
				opt_terminal: s.opt.term? '1' : '0'
			},
			customer.get(),
			p
		);
		data.comments = $comments.val();
		data.status = Order.prototype.POSTPONED;
		data.src = from.get();
		data.dest = to.get();

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
