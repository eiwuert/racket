var React = require('react');
var ReactDOM = require('react-dom');

import {formatDateTime, formatPhone} from '../../lib/format.js';

export default class OrdersTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			closed: true,
			open: true,
			postponed: true
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

	render() {
		return (
			<div>
				{filter(this)}
				<table className="table table-bordered table-condensed">
					<thead>
						<tr>
							<th>Время создания</th>
							<th>Диспетчер</th>
							<th>Клиент</th>
							<th>Адрес подачи</th>
							<th>Комментарии</th>
							<th>Водитель</th>
							<th>Автомобиль</th>
							<th>Статус</th>
						</tr>
					</thead>
					<tbody>
						{this.orders().map(o => <TableRow key={o.order_id} order={o} client={this.props.client} />)}
					</tbody>
				</table>
			</div>
			);
	}
};

function filter(parent) {
	return (
		<div>
			{checkbox('open', 'Текущие', parent)}
			{checkbox('postponed', 'Отложенные', parent)}
			{checkbox('closed', 'Закрытые', parent)}
		</div>
		);
}

function checkbox(key, title, parent) {
	function change(e) {
		var diff = {};
		diff[key] = e.target.checked;
		parent.setState(diff);
	}
	return (<label>
		<input type="checkbox"
		       checked={parent.state[key]}
		       onChange={change}
		       />
			{title}
	</label>);
};

class TableRow extends React.Component {
	render() {
		var disp = this.props.client;
		var order = this.props.order;
		var driver = disp.getDriver(order.taxi_id);
		var car = driver ? disp.getDriverCar(driver.id) : null;
		var stateClass = 'status';
		if(order.status == order.DROPPED) {
			stateClass += ' warning';
		}
		else if(order.postponed()) {
			stateClass += ' info';
		}
		else if(order.closed()) {
			stateClass += ' success';
		}

		return (
			<tr>
				<td className="time">{formatDateTime(time.local(order.time_created))}</td>
				<td className="dispatcher">{order.owner_id}</td>
				<td className="customer">{this.formatCustomer()}</td>
				<td className="addr">{order.src.addr.format()}</td>
				<td className="comments">{order.comments}</td>
				<td className="driver">{driver ? driver.format() : ''}</td>
				<td className="car">{car ? car.format() : ''}</td>
				<td className={stateClass}>{order.statusName()}</td>
			</tr>
			);
	}

	formatCustomer() {
		var order = this.props.order;
		if (!order.customer_phone) {
			return order.customer_name;
		}
		var s = formatPhone(order.customer_phone);
		if (order.customer_name) {
			s += ' (' + order.customer_name + ')';
		}
		return s;
	}
};
