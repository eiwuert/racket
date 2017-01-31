export default OrderForm;

import Group from '../components/order-form/address-group.js';
import CustomerSection from '../components/order-form/customer.js';
import Options from '../components/order-form/options.js';
import Postpone from '../components/order-form/postpone.js';
import Listeners from '../../lib/listeners.js';
import html from '../../lib/html.js';
import obj from '../../lib/obj.js';
import {tpl} from '../../lib/fmt.js';
import {formatPhone} from '../../lib/format.js';

var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

var time = window.time;
var Order = window.Order;

import DriverSelector from '../components/order-form/driver-selector.js';

class FormPart extends React.Component {
	change(diff) {
		var o = _.extend(_.clone(this.props.order), diff);
		this.props.onChange(o);
	}

	driverChange(id) {
		this.change({driverId: id});
	}
	
	optionsChange(opt) {
		this.change({opt});
	}
	
	customerPhoneChange(phone) {
		var customer = _.clone(this.props.order.customer);
		customer.phone = phone;
		this.change({customer});
	}
	
	customerNameChange(name) {
		var customer = _.clone(this.props.order.customer);
		customer.name = name;
		this.change({customer});
	}
	
	acceptCustomerAddress(addr) {
		this.props.onCustomerAddress(addr);
	}

	render() {
		var o = this.props.order;
		return (<div>
			<div className="title">{this.props.title}</div>
			<DriverSelector
				onChange={this.driverChange.bind(this)}
				value={o.driverId}/>
			<Options
				options={o.opt}
				onChange={this.optionsChange.bind(this)}
				disabled={o.driverId != '0'}/>
			<CustomerSection
				name={o.customer.name} phone={o.customer.phone}
				onPhoneChange={this.customerPhoneChange.bind(this)}
				onNameChange={this.customerNameChange.bind(this)}
				onAddress={this.acceptCustomerAddress.bind(this)}
			/>
		</div>);
	}
};

class FormPart2 extends React.Component {
	change(diff) {
		var o = _.extend(_.clone(this.props.order), diff);
		this.props.onChange(o);
	}

	onPostponeToggle(enable) {
		var postpone = _.clone(this.props.order.postpone);
		postpone.disabled = !enable;
		if(enable) {
			postpone.time = time.utc();
			postpone.remind = 0;	
		}
		this.change({postpone});
	}
	
	onPostponeTimeChange(t) {
		var postpone = _.clone(this.props.order.postpone);
		postpone.time = t;
		this.change({postpone});
	}
	
	onPostponeRemindChange(remind) {
		var postpone = _.clone(this.props.order.postpone);
		postpone.remind = remind;
		this.change({postpone});
	}
	
	commentsChange(event) {
		this.change({comments: event.target.value});
	}

	render() {
		var o = this.props.order;
		return (<div>
			<Postpone
				enabled={!o.postpone.disabled}
				time={o.postpone.time}
				remind={o.postpone.remind}
				onTimeChange={this.onPostponeTimeChange.bind(this)}
				onRemindChange={this.onPostponeRemindChange.bind(this)}
				onToggle={this.onPostponeToggle.bind(this)}
			/>
			<div>
				<label>Комментарии</label>
				<textarea value={o.comments} onChange={this.commentsChange.bind(this)}/>
			</div>
			<div className="status">{this.props.status}</div>
			<button type="button"
				disabled={this.props.status != ''}
				onClick={this.props.onAccept}>Отправить</button>
			<button type="button"
				className="cancel"
				onClick={this.props.onCancel}>Закрыть</button>
		</div>);
	}
};

function OrderForm( order )
{
	var listeners = new Listeners([
		"cancel",
		"submit"
	]);
	this.on = listeners.add.bind( listeners );

	var $container = $( '<form class="order-form"></form>' );

	var title = order ? ("Заказ № " + order.order_id) : "Новый заказ";
	
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
		comments: ''
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
		
		s.customer = {
			name: order.customer_name,
			phone: order.customer_phone
		};
		s.comments = order.comments;
	}
	
	var fc = document.createElement('div');
	$container.append(fc);
	
	function r() {
		ReactDOM.render(<FormPart title={title} order={s}
			onChange={onFormChange}
			onCustomerAddress={onCustomerAddress}/>, fc);
	}
	r();
	
	function onFormChange(order) {
		s = order;
		r();
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
	
	function onCustomerAddress(addr) {
		from.set({addr: addr, loc_id: null});
	}

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

	var c2 = document.createElement('div');
	$container.append(c2);
	
	var status = '';
	
	function r2() {
		ReactDOM.render(<FormPart2 order={s}
			status={status}
			onChange={onFormChange2}
			onAccept={accept}
			onCancel={cancel}
			 />, c2);
	}
	r2();

	function onFormChange2(order) {
		s = order;
		r2();
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

	var $controls = $container.find( "input, select, button:not(.cancel), textarea" );

	function div( className ) {
		var $d = $( '<div></div>' );
		if( className ) $d.addClass( className );
		$container.append( $d );
		return $d;
	}

	if( order ) {
		from.set( order.src );
		if( order.dest ) {
			to.set( order.dest );
		}
	}

	this.root = function() {
		return $container.get(0);
	};

	this.lock = function( newstatus ) {
		status = newstatus;
		r2();
		$controls.prop( "disabled", true );
	};

	this.unlock = function() {
		status = '';
		r2();
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
		from.setQueue( qid );
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
		
		var data = obj.merge(
			{
				opt_car_class: s.opt.carClass,
				opt_vip: s.opt.vip? '1' : '0',
				opt_terminal: s.opt.term? '1' : '0',
				customer_phone: s.customer.phone,
				customer_name: s.customer.name
			},
			p
		);
		data.comments = s.comments;
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


function AddressGroupSection( $container )
{
	var c = document.createElement('div');
	$container.append(c);
	var $c = $(c);
	
	var addr = {
		place: disp.param('default_city'),
		street: '',
		house: '',
		building: '',
		entrance: '',
		apartment: ''
	};
	var qid = '0';
	var locName = '';
	var location = null;

	function r() {
		ReactDOM.render(<Group
			qid={qid} onQueueChange={onQueueChange}
			addr={addr} onAddrChange={onAddrChange}
			locName={locName} onLocChange={onLocChange}/>, c);
	}
	r();
	
	function onAddrChange( newAddr ) {
		addr = newAddr;
		qid = null;
		location = null;
		locName = '';
		r();
	}
	
	function onQueueChange(newQid) {
		qid = newQid;
		location = null;
		locName = '';
		var loc = disp.getQueueLocation(qid);
		setAddr(loc ? loc.addr : null);
		r();
	}
	
	function onLocChange(val, item) {
		locName = val;
		location = item;
		setAddr( location ? location.addr : null );
		qid = null;
		r();
	}
	
	function setAddr(newAddr) {
		if(newAddr == null ) {
			newAddr = {
				place: "",
				street: "",
				house: "",
				building: "",
				entrance: "",
				apartment: ""
			};
		}
		addr = newAddr;
	}
	
	this.get = function()
	{
		var loc = disp.getQueueLocation(qid) || location;
		var locId = loc ? loc.loc_id : null;
		return {
			addr: addr,
			loc_id: locId
		};
	};

	this.set = function( spec )
	{
		setAddr( spec.addr );
		qid = locQueue(spec.loc_id);
		r();
	};

	function locQueue( loc_id ) {
		if( !loc_id ) return null;
		var q = disp.queues();
		for( var i = 0; i < q.length; i++ ) {
			if( q[i].loc_id == loc_id ) {
				return q[i].id;
			}
		}
		return null;
	}

	this.setQueue = function( newQid )
	{
		qid = newQid;
		var loc = disp.getQueueLocation(qid);
		if( loc ) {
			location = loc;
			locName = loc ? loc.name : '';
			setAddr( loc.addr );
		}
		r();
	};

	this.slideToggle = function() {
		$c.slideToggle( 'fast' );
	};

	this.hide = function() {
		$c.hide();
	};
}
