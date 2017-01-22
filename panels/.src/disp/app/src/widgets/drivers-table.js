var React = require('react'),
	ReactDOM = require('react-dom');

export default function(disp) {
	var root = document.createElement('div');
	ReactDOM.render(<DriversTable disp={disp} />, root);
	this.root = function() {
		return root;
	};
}

class DriversTable extends React.Component {
	render() {
		return (
			<table className="items">
			<thead>
				<tr><th>Позывной</th><th>Имя</th><th>Телефон</th><th>Автомобиль</th><th>Номер</th><th>Цвет</th></tr>
			</thead>
			<tbody>
				{this.props.disp.drivers().map(d => <Row key={d.id} disp={disp} driver={d} />)}
			</tbody>
			</table>
		);
	}
};

class Row extends React.Component {
	render() {
		var d = this.props.driver;
		var disp = this.props.disp;
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
