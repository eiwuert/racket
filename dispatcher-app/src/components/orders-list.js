import {formatPhone} from '../lib/format.js';
import {fmt} from '../lib/fmt.js';
import CancelOrderDialog from './cancel-order-dialog.js';
var React = require('react');
var ReactDOM = require('react-dom');
var _ = require('underscore');

export default class OrdersList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			cancelDialogs: {}
		};
		this.showCancelDialog = this.showCancelDialog.bind(this);
		this.hideCancelDialog = this.hideCancelDialog.bind(this);
	}
	
	showCancelDialog(order) {
		this.setState(function(s) {
			s.cancelDialogs[order.id] = order;
			return {
				cancelDialogs: s.cancelDialogs
			};
		});
	}
	
	hideCancelDialog(order) {
		this.setState(function(s) {
			var cancelDialogs = s.cancelDialogs;
			delete cancelDialogs[order.id];
			return {cancelDialogs};
		});
	}

	render() {
		var disp = this.props.client;
		var t = this;
		return (<div className="orders-list">
			<List disp={disp}
			      class="postponed"
			      filter={o => o.postponed()}
			      onOrderClick={this.props.onOrderClick}
			      onCancelClick={this.showCancelDialog}
			      />
			<List disp={disp}
			      class="current"
			      filter={o => (!o.postponed() && !o.closed())}
			      onOrderClick={this.props.onOrderClick}
			      onCancelClick={this.showCancelDialog}
			      />
			<List disp={disp}
			      class="closed"
			      filter={o => o.closed()}
			      onOrderClick={this.props.onOrderClick}
				onCancelClick={this.showCancelDialog}
				/>
			{_.values(this.state.cancelDialogs).map(function(order) {
					return <CancelOrderDialog key={order.id}
						order={order} client={disp}
						onAccept={t.hideCancelDialog}
						onDecline={t.hideCancelDialog} />;
			})}
		</div>);
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
					{orders.map(o => <Item key={o.order_id}
						order={o}
						onOrderClick={this.props.onOrderClick}
						onCancelClick={this.props.onCancelClick} />)}
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
		this.cancelClick = this.cancelClick.bind(this);
		this.orderClick = this.orderClick.bind(this);
	}

	cancelClick(e) {
		e.stopPropagation();
		this.props.onCancelClick(this.props.order);
	}

	orderClick() {
		this.props.onOrderClick(this.props.order);
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
		var cancelButton = null;
		if (order.status != order.CANCELLED) {
			cancelButton = <button type="button"
				className="btn btn-default btn-xs pull-right"
				onClick={this.cancelClick}>Отменить</button>;
		}
		return (<div className={this.state.className} onClick={this.orderClick}>
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
		var o = this.props.order;

		if(o.postponed()) {
			cn += ' ' + this.classNameTime();
		}
		else if(o.status == o.FINISHED) {
			cn += ' ' + 'bg-success';
		}
		else if(isActive(o)) {
			cn += ' ' + 'bg-primary';
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

		// Enough time
		if (now < t1) {
			return 'bg-info';
		}
		// after reminder
		if (now < t2) {
			return 'bg-warning';
		}
		// late
		return 'bg-danger';
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
};

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
};

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

function isActive(order) {
	var list = [
		order.WAITING,
		order.STARTED,
		order.ASSIGNED,
		order.ARRIVED
	];
	return list.indexOf(order.status) != -1;
}
