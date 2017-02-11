var React = require('react');
var ReactDOM = require('react-dom');

var Datetime = require('react-datetime');

import {formatDateTime, formatPhone} from '../lib/format.js';
import Table from './table.js';

export default class OrdersArchive extends React.Component {
	constructor(props) {
		super(props);

		var now = new Date();
		now.toDate = function() {
			return this;
		};

		this.state = {
			wait: false,

			orders: [],

			since: now,
			until: now
		};
	}

	/*
	 * Returns orders to be shown
	 */
	orders() {
		var state = this.state;
		var disp = this.props.client;
		return disp.orders().filter(function(order) {
			if (state.open && (!order.closed() && !order.postponed())) {
				return true;
			}
			if (state.closed && order.closed()) {
				return true;
			}
			if (state.postponed && order.postponed()) {
				return true;
			}
			return false;
		});
	}

	setSince(since) {
		this.setState({since});
		this.load(since, this.state.until);
	}

	setUntil(until) {
		this.setState({until});
		this.load(this.state.since, until);
	}

	load(since, until) {
		var filter = {
			since: Math.round(since.toDate().getTime()/1000),
			until: Math.round(until.toDate().getTime()/1000)
		};
		this.setState({wait: true});
		disp.dx.get('orders', filter)
			.then(orders => {
				this.setState({
					orders: orders,
					wait: false
				});
			})
			.catch(error => {
				console.error(error);
				this.setState({wait: false});
			});
	}

	componentDidMount() {
		this.load(this.state.since, this.state.until);
	}

	render() {
		var orders = this.state.orders;
		var tooMany = false;
		if(orders.length > 300) {
			tooMany = true;
			orders = orders.slice(0, 300);
		}

		return (<div>
			<div className="form-inline">
				<div className="form-group">
					<label>От</label>
					<Datetime value={this.state.since} onChange={this.setSince.bind(this)}/>
				</div>
				<div className="form-group">
					<label>До</label>
					<Datetime value={this.state.until} onChange={this.setUntil.bind(this)}/>
				</div>
			</div>
			{this.state.wait && <p>Loading...</p>}
			{tooMany && <p>Слишком много заказов</p>}
			<OrdersTable orders={orders}/>
		</div>);
	}
};

class OrdersTable extends React.Component {
	render() {
		var cols = [
			{key: 'time', title: "Время создания"},
			{key: 'dispatcherInfo', title: "Диспетчер"},
			{key: 'customerInfo', title: "Клиент"},
			{key: 'address', title: "Адрес подачи"},
			{key: 'comments', title: "Комментарии"},
			{key: 'driverInfo', title: "Водитель"},
			{key: 'carInfo', title: "Автомобиль"},
			{key: 'status', title: "Статус"}
		];

		var orders = this.props.orders.map(function(order) {
			return {
				id: order.id,
				time: formatDateTime(order.timeCreated),
				address: order.sourceLocation.address,
				comments: order.comments,
				dispatcherInfo: order.creator.id,
				customerInfo: order.customer.name,
				driverInfo: order.driver.name,
				carInfo: order.car.name,
				status: order.status
			};
		});

		return <Table cols={cols} data={orders}/>;
	}
};
