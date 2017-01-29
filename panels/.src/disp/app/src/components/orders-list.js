import {formatPhone} from '../../lib/format.js';
import {fmt} from '../../lib/fmt.js';
import Listeners from '../../lib/listeners.js';
import Dialog from '../../lib/dialog.js';

var React = require('react');
var ReactDOM = require('react-dom');

import orderForms from '../order-form/forms.js';

export default class OrdersList extends React.Component {
	constructor(props) {
		super(props);
		this.listeners = new Listeners(['order-click', 'cancel-click']);
	}

	componentDidMount() {
		var t = this;
		t.listeners.add('order-click', function(e) {
			orderForms.show(e.data.order);
		});
		t.listeners.add('cancel-click', function(e) {
			showCancelDialog(e.data.order);
		});
	}

	render() {
		var disp = this.props.client;
		return (
			<div className="orders-list">
				<List disp={disp} listeners={this.listeners}
				      class="postponed"
				      filter={o => o.postponed()} />
				<List disp={disp} listeners={this.listeners}
				      class="current"
				      filter={o => (!o.postponed() && !o.closed())} />
				<List disp={disp} listeners={this.listeners}
				      class="closed"
				      filter={o => o.closed()} />
			</div>
			);
	}
};

class List extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			orders: this.props.disp.orders().filter(this.props.filter)
		};
	}

	refresh() {
		var filter = this.props.filter;
		var orders = this.props.disp.orders().filter(filter);
		this.setState({orders});
	}

	componentDidMount() {
		this.refresh();
		var e = ['order-changed', 'order-added', 'order-removed'];
		var disp = this.props.disp;
		var ref = this.refresh.bind(this);
		e.forEach(e => disp.on(e, ref));
	}

	render() {
		var orders = this.state.orders;
		return (
			<div className={this.props.class}>
				<div className="list">
					{orders.map(o => <Item listeners={this.props.listeners} key={o.order_id} order={o} />)}
				</div>
			</div>
			);
	}
}

class Item extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			className: this.className()
		};
	}

	cancelClick(e) {
		e.stopPropagation();
		this.props.listeners.call('cancel-click', {order: this.props.order});
	}

	orderClick() {
		this.props.listeners.call('order-click', {order: this.props.order});
	}

	componentDidMount() {
		this.timer = setInterval(this.refresh.bind(this), 5000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
		this.timer = null;
	}

	refresh() {
		this.setState({className: this.className()});
	}

	statusString() {
		var order = this.props.order;
		var s = order.statusName();
		if (order.postponed()) {
			s += ", подать в " + formatTime(order.exp_arrival_time);
		} else {
			s = formatTime(order.time_created) + ", " + s;
		}
		return s;
	}

	render() {
		var order = this.props.order;
		var cancelButton = '';
		if (order.status != order.CANCELLED) {
			cancelButton = (
				<div className="cancel" onClick={this.cancelClick.bind(this)}>Отменить</div>
				);
		}
		return (
			<div className={this.state.className} onClick={this.orderClick.bind(this)}>
				{cancelButton}
				<div className="number">№ {order.order_id}</div>
				<DestinationInfo order={order} />
				<div className="comments">{order.comments}</div>
				<CustomerInfo order={order} />
				<div className="status">{this.statusString()}</div>
				<div className="driver">{formatDriver(order)}</div>
			</div>
			);
	}

	className() {
		var cn = 'order';
		if (this.props.order.postponed()) {
			cn += ' ' + this.classNameTime();
		}
		return cn;
	}

	classNameTime() {
		var order = this.props.order;
		var now = time.utc();
		var t1 = order.reminder_time;
		var t2 = order.exp_arrival_time;
		if (t1 > t2) {
			t1 = t2;
		}

		// Enough time - green.
		if (now < t1) {
			return 'far';
		}
		// after reminder - yellow
		if (now < t2) {
			return 'soon';
		}
		// 10 minutes late - red
		if (now < t2 + 600) {
			return 'urgent';
		}
		// expired.
		return 'expired';
	}
}

class CustomerInfo extends React.Component {
	render() {
		var order = this.props.order;
		var n = order.customer_phone;
		if (!n || n == '' || n == '+375') {
			return null;
		}
		return <a href={'tel:' + n}>{formatPhone(n)}</a>;
	}
}

class DestinationInfo extends React.Component {
	render() {
		var disp = window.disp;
		var order = this.props.order;
		var loc = disp.getLocation(order.src_loc_id);
		var locInfo = null;
		if (loc) {
			locInfo = <span className="location">{loc.name}</span>;
		} else {
			locInfo = <span>{order.formatAddress()}</span>;
		}
		return <div className="destination">{locInfo}</div>;
	}
}

/*
 * Write a UTC time as a readable local time string.
 */
function formatTime(t)
{
	/*
	 * As we receive a pure UTC, we have to compensate for the
	 * client's wrong clock.
	 */
	t = time.local(t);
	var d = new Date(t * 1000);
	var s = fmt("%02d:%02d", d.getHours(), d.getMinutes());

	var now = new Date(time.utc() * 1000);
	if (d.getDate() == now.getDate()
		&& d.getMonth() == now.getMonth()
		&& d.getFullYear() == now.getFullYear()) {
		return s;
	}

	var diff = (d.getTime() - now.getTime()) / 1000 / 3600 / 24;

	if (diff > 0 && diff < 1) {
		s += " завтра";
	} else if (diff < 0 && diff > -1) {
		s += " вчера";
	} else {
		var monthNames = [
			'января', 'февраля', 'марта', 'апреля', 'мая',
			'июня', 'июля', 'августа', 'сентября', 'октября',
			'ноября', 'декабря'
		];
		s += ", " + d.getDate() + " " + monthNames[d.getMonth()];
	}

	return s;
}

function formatDriver(order)
{
	var taxi = disp.getDriver(order.taxi_id);
	var call_id = taxi ? taxi.call_id : null;
	if (call_id) {
		return call_id;
	}
	return '';
}


/*
 * Dialog for order cancelling.
 */
function showCancelDialog( order )
{
	var html = '<p>Отменить заказ?</p>'
		+ '<textarea placeholder="Причина отмены"></textarea>';
	if( order.taxi_id ) {
		html += '<div><label><input type="checkbox"> Восстановить в очереди</label></div>';
	}
	var $content = $( '<div>' + html + '</div>' );
	var $reason = $content.find( 'textarea' );
	var $restore = $content.find( 'input[type="checkbox"]' );

	var d = new Dialog( $content.get(0) );
	d.addButton( 'Отменить заказ', cancel, 'yes' );
	d.addButton( 'Закрыть окно', null, 'no' );
	d.show();

	function cancel()
	{
		var reason = $reason.val();
		var restore = $restore.is( ':checked' );

		var p = disp.cancelOrder( order.order_uid, reason );
		if( restore && order.taxi_id ) {
			p.then( function() {
				disp.restoreDriverQueue( order.taxi_id );
			});
		}
		this.close();
	}
}
