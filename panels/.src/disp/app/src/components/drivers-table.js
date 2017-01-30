var React = require('react');
var ReactDOM = require('react-dom');
import Table from './table.js';

export default class DriversTable extends React.Component {
	render() {
		var disp = this.props.client;

		var columns = [
			{title: 'Позывной', key: 'call_id'},
			{title: 'Имя', key: 'driver_name'},
			{title: 'Телефон', key: 'phone'},
			{title: 'Автомобиль', key: 'car_name'},
			{title: 'Номер', key: 'car_plate'},
			{title: 'Цвет', key: 'car_color'},
		];

		var data = disp.drivers().map(function(d) {
			var c = disp.getCar(d.car_id);
			if (!c) {
				c = {name: "", plate: "", color: ""};
			}
			return {
				call_id: d.call_id,
				driver_name: d.name,
				phone: d.phone,
				car_name: c.name,
				car_plate: c.plate,
				car_color: c.color
			};
		});
		return <Table cols={columns} data={data} className="items" />;
	}
};
