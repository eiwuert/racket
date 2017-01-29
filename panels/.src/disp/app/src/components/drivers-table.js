var React = require('react');
var ReactDOM = require('react-dom');

export default class DriversTable extends React.Component {
	render() {
		var disp = this.props.client;
		return (
			<table className="items">
			<thead>
				<tr><th>Позывной</th><th>Имя</th><th>Телефон</th><th>Автомобиль</th><th>Номер</th><th>Цвет</th></tr>
			</thead>
			<tbody>
				{disp.drivers().map(d => <Row key={d.id} client={disp} driver={d} />)}
			</tbody>
			</table>
		);
	}
};

class Row extends React.Component {
	render() {
		var d = this.props.driver;
		var disp = this.props.client;
		var c = disp.getCar( d.car_id );
		if( !c ) c = {name: "", plate: "", color: ""};
		return (
			<tr>
			<td>{d.call_id}</td>
			<td>{d.name}</td>
			<td>{d.phone}</td>
			<td>{c.name}</td>
			<td>{c.plate}</td>
			<td>{c.color}</td>
			</tr>
		);
	}
};
